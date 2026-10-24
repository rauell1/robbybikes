# Deployment guide

Production target: **Vercel** (hosting) + **Neon** (PostgreSQL) + **Vercel Blob** (photos). The same steps work with any Node host that supports Next.js 16 and any PostgreSQL 15+ server.

## 0. Before you start

Collect from the owner:

- which phone number has WhatsApp (see `docs/BUSINESS-VERIFICATION.md`);
- the confirmed trading/legal name for the footer and terms;
- real photographs and stock data — demo inventory must not ship;
- the production domain.

## 1. Create the database (Neon)

1. Create a project at <https://neon.tech>, region closest to Nairobi (Frankfurt or AWS Africa if available).
2. Copy the **pooled** connection string. It looks like:
   `postgresql://user:password@ep-xxx-pooler.eu-central-1.aws.neon.tech/robbybikes?sslmode=require`
3. Keep it for the next step. The app connects with `postgres-js` and `prepare: false`, which is compatible with Neon's pooled endpoint.

## 2. Import the repository into Vercel

1. <https://vercel.com/new> → import `rauell1/robbybikes`.
2. Framework preset: Next.js (detected). Build command `npm run build`, install command `npm ci`.
3. Do **not** deploy the local demo database; the app has no dependency on it.

## 3. Environment variables

Set these for Production (and Preview if you want previews to work):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>` (no trailing slash) |
| `ADMIN_SESSION_SECRET` | output of `openssl rand -base64 48` — different from local |
| `WHATSAPP_NUMBER` | confirmed WhatsApp number, digits only |
| `BLOB_READ_WRITE_TOKEN` | from the Vercel Blob store (step 4) |
| `SOCIAL_TIKTOK_URL` | only once the profile is verified — otherwise leave unset |
| `NEXT_PUBLIC_GA_ID` | optional GA4 measurement ID |

Leave `DEMO_MODE` unset. It exists so the local seeder can create a demo administrator; if it is set in production, the demo credentials are shown on the login screen.

## 4. Blob storage for photos

Vercel dashboard → **Storage → Create → Blob** → connect it to the project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically; confirm it exists in the project's environment variables. Without it, uploads fall back to the local filesystem, which is read-only/ephemeral on Vercel — administrators uploads would fail.

## 5. First deploy

1. Deploy from `main` (merge the pull request first).
2. Run the migrations and create the first administrator from your machine, pointed at Neon:

```bash
DATABASE_URL="postgresql://…neon.tech/robbybikes?sslmode=require" npm run db:migrate
DATABASE_URL="…" npm run db:sample:clear      # if you ever seeded demo data
DATABASE_URL="…" npm run admin:create -- --email owner@example.com --password 'a-long-password'
```

3. Sign in at `https://<domain>/admin/login`, add the first real motorcycle, and check it appears on `/bikes`.

## 6. Domain

1. Vercel → Project → **Settings → Domains** → add `robbybikes.co.ke` (or the chosen domain).
2. At the registrar, point the apex `A`/`ALIAS` record and the `www` `CNAME` at Vercel as instructed.
3. After the certificate is issued, set `NEXT_PUBLIC_SITE_URL` to the final URL (including `https://`) and redeploy — canonical links, the sitemap, Open Graph images and WhatsApp listing links all derive from it.
4. Submit `https://<domain>/sitemap.xml` in Google Search Console.

## 7. Backups

- **Neon**: enable point-in-time restore (available on paid plans; the free tier keeps a short window). Take a manual backup before bulk imports.
- **Manual dump** (from any machine with the connection string):

```bash
pg_dump "postgresql://…neon.tech/robbybikes?sslmode=require" \
  --no-owner --no-privileges --format=custom --file robbybikes-$(date +%F).dump
```

- **Restore** into an empty database:

```bash
pg_restore --clean --no-owner --no-privileges \
  --dbname "postgresql://…neon.tech/robbybikes?sslmode=require" robbybikes-2026-10-24.dump
```

- **Photos**: Vercel Blob is the source of truth for uploads. Keep the original photographs on the dealership's own drive as well — Blob is a serving layer, not an archive.
- Test a restore into a scratch database at least once before launch, and again after any schema change.

## 8. Ongoing operations

| Task | Command / place |
| --- | --- |
| Add or reset an administrator | `npm run admin:create -- --email … --password '…'` with `DATABASE_URL` set |
| Apply a new migration | `npm run db:migrate` (or automatic on the next deploy if you wire it) |
| Remove demo content | `npm run db:sample:clear` |
| Bulk-add stock | `npm run inventory:import -- --file stock.csv` — always `--dry-run` first |
| Roll back code | Vercel → Deployments → promote the previous deployment |
| Roll back schema | Neon point-in-time restore, then redeploy the matching code |

## 9. Post-launch checklist

- [ ] `npm run build` is warning-free on the deployed commit.
- [ ] `/`, `/bikes`, a real listing, `/brands`, `/contact` load on the production domain.
- [ ] Unknown listing returns 404, and `/admin` redirects to login.
- [ ] `robots.txt` and `sitemap.xml` reference the production domain.
- [ ] A real enquiry submitted on the site appears in `/admin/enquiries`.
- [ ] A real photo uploaded through the console appears on the listing and is served from Blob.
- [ ] Demo listings removed (`npm run db:sample:clear`) and the demo banner no longer appears.
- [ ] `DEMO_MODE` is unset in Vercel.
- [ ] Backup and restore rehearsed.
