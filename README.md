# Robbybikes

Website and inventory platform for **Robbybikes**, a used motorcycle dealership on Juja Road, Eastleigh, Nairobi (near the Amana / Luqman petrol station). The site lets customers browse live stock, contact the dealership by phone or WhatsApp, and send an enquiry. The admin console lets the team manage listings, photographs and customer enquiries without touching the database.

Built with Next.js 16 (App Router), TypeScript (strict), Tailwind CSS 4, Drizzle ORM and PostgreSQL.

---

## Contents

- [What is included](#what-is-included)
- [Requirements](#requirements)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Database and migrations](#database-and-migrations)
- [Administrator accounts](#administrator-accounts)
- [Managing stock](#managing-stock)
- [Enquiries](#enquiries)
- [Sample (demo) data](#sample-demo-data)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [House rules for content](#house-rules-for-content)
- [Troubleshooting](#troubleshooting)

---

## What is included

**Public site**

| Route | Purpose |
| --- | --- |
| `/` | Hero, search panel, featured motorcycles, browse by brand, why-us, three-step buying guide, location and contact call-to-action. |
| `/bikes` | Full inventory with URL-synced filters (brand, model/keyword, price, engine cc, year, condition, transmission, use, availability), sorting, result counts, pagination, loading skeletons plus empty and error states. |
| `/bikes/[slug]` | Listing detail with photo gallery, specifications, description, Call / WhatsApp / Arrange viewing / Share actions and breadcrumbs. |
| `/brands` | Brand index with live stock counts. |
| `/about` | How the dealership works, what to expect and what is not claimed. |
| `/contact` | Both phone numbers, WhatsApp, Facebook, landmark directions and the enquiry form. |
| `/privacy`, `/terms` | Privacy notice and terms of use. |

**Admin console** (`/admin`, server-authenticated on every request)

- Dashboard with stock, publishing and enquiry counters.
- Inventory list with search, status and publishing controls.
- Create/edit motorcycles, upload photographs, reorder them, set the main photo, delete photos, set availability (available, reserved, pending sale, sold) and publish/unpublish.
- Preview a listing exactly as customers see it.
- Enquiry inbox with statuses (new, contacted, in progress, closed) and internal follow-up notes.

**Platform**

- Drizzle schema, SQL migrations, indexes and constraints.
- Cookie-based admin sessions (signed JWT, scrypt password hashes, active-account re-check, proxy gate).
- Server-side validation on every form action, image upload restrictions, honeypot plus per-IP and per-phone rate limiting on the public enquiry form.
- SEO: per-page metadata, canonical URLs, Open Graph/Twitter cards, `sitemap.xml`, `robots.txt` and JSON-LD (`AutoDealer`, `Product`/`Offer`, `BreadcrumbList`).
- CSV inventory import with a validated template.

---

## Requirements

- Node.js 22 or newer (tested on 22.x)
- npm 10 or newer
- PostgreSQL for production (Neon recommended) **or** nothing extra for local previews - `npm run demo:db` starts a local PostgreSQL cluster for you

---

## Local development

```bash
npm ci
cp .env.example .env.local
```

Edit `.env.local`:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/postgres"
ADMIN_SESSION_SECRET="<output of: openssl rand -base64 48>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Then use two terminals:

```bash
# Terminal A - embedded PostgreSQL for local previews only
npm run demo:db

# Terminal B - schema, demo content and the dev server
npm run db:seed
npm run dev
```

The site is at <http://localhost:3000> and the admin console at <http://localhost:3000/admin>.

`npm run demo:db` prints the connection string it is listening on. It stores data in `.data/pg` and shuts down cleanly with `Ctrl+C`. It is a development convenience only - it is never used when `DATABASE_URL` points at a hosted database.

Create a real administrator instead of using the demo one:

```bash
npm run admin:create -- --email you@example.com --password 'a-long-password'
```

---

## Environment variables

All variables are read on the server only, except `NEXT_PUBLIC_*` values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. Neon in production; the local demo URL in development. |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical site URL used for canonical links, Open Graph, the sitemap and WhatsApp message links. |
| `ADMIN_SESSION_SECRET` | Yes | Secret used to sign admin session cookies. At least 32 characters. |
| `WHATSAPP_NUMBER` | Yes | WhatsApp number in international format, digits only. Confirm with the owner which SIM has WhatsApp. |
| `SOCIAL_TIKTOK_URL` | No | Official TikTok profile. Leave blank until the account is verified; blank hides the link. |
| `BLOB_READ_WRITE_TOKEN` | Production uploads | Vercel Blob token. Without it, uploads are written to `UPLOAD_DIR`. |
| `UPLOAD_DIR` | No | Filesystem location for uploads when Blob is not configured. Defaults to `.data/uploads`. |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics 4 measurement ID. Analytics stays off when blank. |
| `SERVER_ACTION_ALLOWED_ORIGINS` | No | Extra comma-separated hostnames allowed to post server actions when behind a proxy. |
| `DEMO_MODE` | No | When `1`, the seeder creates the demo administrator and the login screen shows demo hints. Never set in production. |
| `DEMO_DB_DATA_DIR`, `DEMO_DB_PORT` | No | Where `npm run demo:db` stores data and which port it listens on. |

Never commit real secrets. `.env.local` is git-ignored.

---

## Database and migrations

```bash
npm run db:generate    # create a migration after editing lib/db/schema.ts
npm run db:migrate     # apply pending migrations
npm run db:seed        # demo listings, images, enquiries and (in DEMO_MODE) a demo admin
npm run db:reset -- --force   # drop the public schema, re-run migrations (destructive)
```

Migrations live in `drizzle/`. They are applied automatically by `npm run demo:db`, `npm run db:seed`, `npm run admin:create` and `npm run inventory:import`, so a fresh database is ready after any of those commands.

Schema summary:

- `motorcycles` - brand, model, slug, year, engine cc, asking price (integer, KES), condition, odometer, transmission, fuel type, colour, use, registration paperwork, description, inspection notes, service history, status, publishing flags, `is_sample`, internal notes, timestamps.
- `motorcycle_images` - ordered photographs per motorcycle, with alt text and optional blob key.
- `enquiries` - customer name, normalised phone, optional email, preferred contact method, message, linked motorcycle, source, status, internal notes and consent timestamp.
- `admin_users` - email, name, scrypt password hash, role (`admin`/`staff`), active flag.

Prices are stored as whole-shilling integers and formatted for display (`KSh 125,000`); they are never stored as formatted strings.

---

## Administrator accounts

```bash
npm run admin:create -- --email owner@example.com --password 'a-long-password'
npm run admin:create -- --email staff@example.com --password 'another-password' --name "Yard staff" --role staff
```

Re-running the command with an existing email resets that account's password. Sessions last eight hours, are HttpOnly and are re-validated against the database on each request, so deactivating an account ends access immediately.

There is no self-service signup and no password reset by email - create or reset accounts from the command line.

---

## Managing stock

1. Sign in at `/admin`.
2. **Inventory → Add motorcycle**, or edit an existing record.
3. Fill in only what you know. Blank fields are hidden on the public site rather than guessed.
4. Upload photographs (JPG, PNG, WebP or AVIF, 6 MB maximum each). The first photo is the main image; use the arrows to reorder and the star to promote a photo.
5. Save as a draft first if the listing is incomplete, then publish from the inventory list.
6. When a motorcycle is sold, set its status to **Sold** instead of deleting it. Sold bikes disappear from available stock but remain in the archive.

### Bulk import from CSV

1. Copy `data/inventory-template.csv`.
2. Keep the header row, delete the example row, add one row per motorcycle.
3. Required columns: `brand`, `model`, `price_kes`. Everything else is optional.
4. Separate multiple image URLs with `|`.
5. Preview, then import:

```bash
npm run inventory:import -- --file data/my-stock.csv --dry-run
npm run inventory:import -- --file data/my-stock.csv
```

Add `--publish` to publish rows that do not set `is_published`, and `--sample` to flag imported rows as demonstration data. Invalid rows abort the whole import before anything is written.

---

## Enquiries

- The contact form and every listing carry an enquiry form. Submitting it records an enquiry; **opening a WhatsApp chat is not an enquiry**.
- Consent is required and recorded with a timestamp.
- Protections: server-side validation, honeypot field, minimum time on page, per-IP limit (8 per 10 minutes) and per-phone limit (3 per hour).
- Enquiries appear in `/admin/enquiries`, where the team can move them through **new → contacted → in progress → closed** and keep internal notes.
- Failed enquiries show inline errors; the record is never partially written.

---

## Sample (demo) data

`npm run db:seed` loads ten clearly labelled demonstration listings, twenty illustrative photos and three sample enquiries. Every record is flagged (`motorcycles.is_sample`, enquiry source `seed-sample`) and the public site shows a **Sample** badge plus a demo-data banner.

Remove it before launch:

```bash
npm run db:sample:clear
```

Real records are untouched by that command. The sample photographs in `public/sample/` are AI-generated placeholders and must be replaced with dealership photography before launch.

---

## Testing

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # production build (must stay warning-free)
npm test            # scripted data/logic tests
npm run test:smoke  # HTTP smoke test against a running server
```

The smoke test expects a running site (`npm run start` or `npm run dev`) and a seeded demo database. `npm run test:smoke -- -vv` style verbosity is not required - the script prints one line per check.

---

## Deployment

Production target: **Vercel** + **Neon PostgreSQL**.

1. Create a Neon project and copy the pooled connection string (`...?sslmode=require`).
2. Import the repository into Vercel.
3. Set environment variables in Vercel: `DATABASE_URL`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `WHATSAPP_NUMBER`, and `BLOB_READ_WRITE_TOKEN` (create a Blob store in the Vercel dashboard for image uploads).
4. Leave `DEMO_MODE` unset so no demo administrator is created.
5. Deploy, then apply migrations and remove any demo content:

```bash
DATABASE_URL="<neon-url>" npm run db:migrate
DATABASE_URL="<neon-url>" npm run db:sample:clear
DATABASE_URL="<neon-url>" npm run admin:create -- --email owner@example.com --password 'a-long-password'
```

6. Point the domain at Vercel, then update `NEXT_PUBLIC_SITE_URL` and redeploy so canonical URLs, the sitemap and WhatsApp listing links use the real domain.

**Never run `npm run demo:db` in production.** It exists only for local previews. Production always uses the hosted `DATABASE_URL`.

---

## Project structure

```
app/
  (site)/            public pages and layout
  admin/             login, protected console, server actions entry points
  api/uploads/       serves locally stored uploads
  layout.tsx         root layout, metadata defaults
  robots.ts          robots.txt
  sitemap.ts         sitemap.xml
components/
  admin/             console UI (forms, image manager, navigation)
  bikes/             inventory grid, filters, gallery, pagination
  forms/             enquiry form
  home/              homepage sections
  site/              header, footer, breadcrumbs, WhatsApp button
  ui/                small primitives (button, input, field, badge)
lib/
  actions/           server actions (public enquiry, auth, admin inventory, admin enquiries)
  db/                schema, connection, public queries, admin queries
  auth*.ts           session signing and verification
  business.ts        single source of truth for dealership details
  validation.ts      Zod schemas shared by forms and server actions
  storage.ts         image storage (Vercel Blob or local disk)
  seo.ts             metadata and JSON-LD helpers
drizzle/             generated SQL migrations
scripts/             CLI scripts (seed, migrate, import, demo database, tests)
data/                sample inventory and CSV template
public/sample/       illustrative demo photography
```

---

## House rules for content

These rules are part of the product, not just guidance:

- Publish only verified information. No invented stock, prices, reviews, testimonials, warranties, awards, founding dates, sales figures, or map coordinates.
- Demonstration listings are always labelled **Sample** and must never be presented as real inventory.
- Prices are asking prices; the agreed price is settled after inspection in person.
- Unknown specifications stay blank on the site rather than showing zero or a guess.
- Sold motorcycles leave the available stock list; only administrators change availability.
- No online payments in v1 - the conversion path is an enquiry followed by an in-person inspection.
- Opening hours, the TikTok profile and an exact map pin are intentionally omitted until the dealership confirms them.

---

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `DATABASE_URL is not configured` | Copy `.env.example` to `.env.local` and start `npm run demo:db`, or point `DATABASE_URL` at Neon. |
| `ECONNREFUSED 127.0.0.1:5433` | The demo database is not running. Start `npm run demo:db` in its own terminal. |
| `port 5433 already in use` | Another demo database is running. Stop it, or change `DEMO_DB_PORT` and update `DATABASE_URL`. |
| Admin login says the session expired after every action | `ADMIN_SESSION_SECRET` is missing or changed between restarts. Set it once and keep it stable. |
| Uploads fail in production | `BLOB_READ_WRITE_TOKEN` is missing. Local disk storage is not persistent on serverless hosts. |
| Images upload but do not appear | The file exceeded 6 MB or was not a real JPG/PNG/WebP/AVIF. Check the error shown under the upload field. |
| `npm run db:seed` fails with duplicate keys | Demo data already exists. Use `npm run db:sample:clear` or `npm run db:reset -- --force` for a clean slate. |
| Sitemap or canonical URLs point at localhost | Set `NEXT_PUBLIC_SITE_URL` to the production domain and redeploy. |

---

## Licence and ownership

Private project for Robbybikes. Not intended for redistribution.
