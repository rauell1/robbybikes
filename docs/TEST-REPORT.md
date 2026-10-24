# Test report

Scope: the Robbybikes website, admin console, enquiry pipeline and data layer built in this branch.
Environment: local Linux sandbox, Node 22.22.3, npm 10.9.8, Next.js 16.4.3, production build (`npm run build` → `npm run start`), PostgreSQL 18.4 local demo cluster, seeded demo data (10 sample listings, 20 photos, 3 sample enquiries).

Anything not run here is listed under [Not covered](#not-covered) rather than implied.

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| TypeScript, strict | `npm run typecheck` | Pass, no errors |
| ESLint (flat config, Next core rules) | `npm run lint` | Pass, no errors or warnings |
| Production build | `npm run build` | Pass, no warnings; routes render as expected |
| Unit checks (29) | `npm test` | Pass |
| HTTP smoke test (21) | `npm run test:smoke` | Pass against the production server |

`npm test` covers phone normalisation, price/spec formatting, slug generation, filter parsing/serialisation, CSV parsing, enquiry validation (phone, consent, honeypot, email), rate limiting and WhatsApp/tel link generation.

`npm run test:smoke` covers public page rendering, structured data presence, robots and sitemap, listing detail with WhatsApp/tel links and price, 404 for unknown listings, filter/sort/pagination URLs, noindex on deep-filtered inventory, admin redirects, anonymous server-action POSTs, upload path traversal and admin noindex.

## Manual verification against the production build

### Public site

- `/`, `/bikes`, `/brands`, `/about`, `/contact`, `/privacy`, `/terms` return 200; unknown listing slugs return 404.
- Filters verified against known demo data: all (9 in stock), brand=Bajaj (2), Bajaj with a 100,000–140,000 range (2), availability=sold (1), `q=boxer` (2), condition=excellent + price_desc (1), minCc=150 (4), page=2, and an empty result state for an unknown brand.
- Empty state renders explanatory copy plus "Clear filters" and a WhatsApp option, not a blank grid.
- Listing page shows gallery, specs, description, breadcrumbs, Call, WhatsApp (message contains model, year, cc, `KSh` price and the absolute listing URL), Arrange viewing and Share.
- Enquiry form: valid submission stored and linked to the correct motorcycle; invalid phone rejected inline; missing consent rejected server-side; honeypot submission silently accepted without writing a record; IP rate limit enforced.

### Admin console

- Login with the demo administrator returns a session cookie (HttpOnly) and redirects to `/admin`.
- Unauthenticated `/admin`, `/admin/bikes`, `/admin/bikes/new`, `/admin/enquiries` → 307 to `/admin/login?next=…`.
- Unauthenticated server-action POST to an admin route → 307 to login; nothing was written.
- Dashboard counts reflect the seeded data (10 listings, 7 available, 1 pending sale, 1 reserved, 1 sold, 3 enquiries).
- Status change available → reserved → available reflected on the public listing.
- Publish toggle: unpublishing hides the listing (public URL 404), republishing restores it.
- Image upload: JPEG accepted and served from `/api/uploads/…`; HTML file renamed `.jpg` rejected with "That file does not look like a valid image"; 7 MB upload rejected with the 6 MB message; uploaded photo promoted to main image and rendered first on the listing.
- Image delete removed both the database row and the stored file; the URL then returned 404.
- Upload endpoint rejects `..%2F..%2Fpackage.json`, unknown filenames and `.svg`.
- Enquiry update: status → in progress and internal notes saved and re-rendered after reload.

### SEO

- Per-page `<title>`, description, canonical and Open Graph tags present on home, inventory, listing and marketing pages.
- Listing JSON-LD: `Product` with `Offer` (KES 149000, `InStock`), `Brand`, `PropertyValue` specs, plus `BreadcrumbList`.
- Homepage JSON-LD: `AutoDealer` with both phone numbers and the landmark address.
- `sitemap.xml` lists static pages plus published listings; sold/unpublished listings are excluded.
- `robots.txt` disallows `/admin` and `/api/`, and references the sitemap.
- Deep-filtered and paginated inventory URLs emit `noindex, follow`; a single-brand URL stays indexable.

## Defects found and fixed during testing

| Defect | Fix |
| --- | --- |
| Unknown listing slugs returned 200 with an empty page because a route-level `loading.tsx` streamed before `notFound()`. | Removed the route-level loading file; the inventory list uses an explicit Suspense boundary, so unknown slugs return 404. |
| Admin pages crashed (500) when a server action returned a value from a `"use server"` module. | Moved initial action states into `lib/actions/state.ts`. |
| Uploads and local storage referenced the project root dynamically, producing a "Dynamic filesystem access" build warning. | Scoped storage to a static `.data/uploads` root with explicit tracing ignores; build is warning-free. |
| `lib/migrations.ts` imported `server-only`, which broke CLI scripts. | Removed the import; scripts and the app share the same migrator. |
| The local demo database dropped connections under concurrent queries. | Replaced the in-process PGlite approach with a dedicated local PostgreSQL server (`npm run demo:db`) and a normal pooled connection in the app. |
| `db:reset` left the migration ledger behind, so re-seeding failed. | Reset now drops both `public` and `drizzle` schemas before re-running migrations. |
| White text on `accent-500` and the old WhatsApp green failed WCAG AA (3.62:1 / 4.14:1). | Buttons use `accent-600`/`accent-700` and `#0b7364`; text-mist-400 no longer carries copy. |
| Draft copy implied an unverified price range and "listed now" stock counts. | Removed the price-range claim and relabelled the hero counter "available now". |

## Not covered

- **No real browser or device testing.** The sandbox could not download a browser binary, so there are no screenshots, no Lighthouse run and no real iPhone/Android check. Layout was validated by reading rendered HTML and Tailwind classes only. Run Lighthouse and a device pass after deployment.
- **No live Vercel/Neon deployment.** All testing used the local PostgreSQL demo server. Neon-specific behaviour (pooled endpoint, cold starts) is untested.
- **No email, SMS or WhatsApp API integration** — none exists by design.
- **Rate limiting is per process.** Behaviour behind multiple serverless instances is not verified.
- **No load or penetration testing.** Only the checks described above.
- **Accessibility**: colour contrast was calculated manually and landmarks/labels are present in markup, but no screen-reader or automated axe audit was run.

## Recommendation before launch

1. Run `npm test` and `npm run test:smoke` against production after the first deploy.
2. Replace demo stock and photographs, then run `npm run db:sample:clear`.
3. Complete `docs/BUSINESS-VERIFICATION.md` with the owner.
4. Run Lighthouse on a mid-range Android profile and fix any regressions found there.
