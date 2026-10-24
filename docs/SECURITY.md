# Security notes

How the Robbybikes site protects the admin console, customer data and uploads, and what still relies on the hosting platform.

## Administrator authentication

- Sessions are signed JSON Web Tokens (HS256) stored in an HttpOnly, `SameSite=Lax` cookie (`robbybikes_admin`), valid for eight hours. The secret is `ADMIN_SESSION_SECRET`; rotating it signs everybody out.
- Passwords are hashed with scrypt (per-user random salt, timing-safe comparison). There is no custom password storage and no password reuse elsewhere.
- `proxy.ts` rejects unauthenticated requests to `/admin/**` before they reach a page, redirecting to `/admin/login?next=…`.
- Every admin page and **every server action** independently calls `requireAdmin()` - hiding links is never the only protection. A request with a valid-looking URL but no session is redirected, and the action performs nothing.
- The session token is re-validated against the `admin_users` table on each request, so deactivating an account or changing its role takes effect immediately rather than at cookie expiry.
- Login attempts go through the same rate limiter as public enquiries.
- There is no signup route. Administrators are created from the command line (`npm run admin:create`), which also acts as the password reset path.

## Secrets

- `DATABASE_URL`, `ADMIN_SESSION_SECRET`, `WHATSAPP_NUMBER` and `BLOB_READ_WRITE_TOKEN` are read on the server only. Nothing sensitive is bundled into client JavaScript; only `NEXT_PUBLIC_SITE_URL` and optional `NEXT_PUBLIC_GA_ID` are public by design.
- `.env.local` is git-ignored and `.env.example` contains placeholders only.
- `ADMIN_SESSION_SECRET` must be at least 32 characters (`openssl rand -base64 48`). The app refuses to sign sessions with a missing secret rather than falling back to a default.

## Customer enquiries

- Server-side validation with Zod on every field; the browser-side hints are convenience only.
- Kenyan mobile numbers are normalised (`+2547XXXXXXXX` / `+2541XXXXXXXX`) before storage, so duplicates are comparable.
- Spam protection: hidden honeypot field, a minimum time between render and submit, per-IP limit (8 per 10 minutes) and per-phone limit (3 per hour). Honeypot and too-fast submissions receive a normal success message so bots learn nothing.
- Consent is required and the timestamp is stored with the enquiry.
- Enquiry records are never exposed on a public route. Only signed-in administrators can read them.

## Uploads

- The upload field and the "add photo by URL" field are admin-only.
- Accepted types: JPG, PNG, WebP, AVIF. The file signature is checked against the declared MIME type, so renaming a script to `.jpg` is rejected.
- Maximum size is 6 MB, enforced in the server action (`serverActions.bodySizeLimit: "10mb"`).
- Stored filenames are generated UUIDs; the original client filename is discarded.
- Local uploads are served by `/api/uploads/[fileName]` with an extension allowlist and a fixed `.data/uploads` root - `..` traversal, nested paths and `.svg` (script-capable) files return 404.
- Production uses Vercel Blob, whose URLs are immutable and served from a separate origin.

## Transport and headers

`next.config.ts` sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy` (camera, microphone, geolocation and payments disabled) and `poweredByHeader: false`. HTTPS is provided by the host (Vercel) and enforced at the domain level.

## Known limitations

- **Rate limiting is in-memory.** It is reliable on a single instance, which covers local use and small deployments, but serverless instances do not share memory. For strict enforcement at scale, add a platform WAF rule or a shared store (Upstash Redis) and swap `lib/rate-limit.ts`.
- **No email notifications.** Enquiries land in the admin console; the team should check it during opening hours. Adding transactional email is a follow-up decision, not an omission.
- **No two-factor authentication.** Accounts are limited to staff the owner creates; use long unique passwords.
- **No automated dependency scanning** is configured in the repository; `npm audit` and Vercel's dependency alerts are the current controls.
- **No CSRF token beyond Next.js server actions.** Server actions are same-origin POSTs with framework-generated action identifiers; `SERVER_ACTION_ALLOWED_ORIGINS` exists for proxied previews and should stay empty in production.

## Reporting a problem

If an administrator account is suspected to be compromised: rotate `ADMIN_SESSION_SECRET` (signs everyone out), reset the password with `npm run admin:create -- --email <address> --password '<new>'`, and review `/admin/enquiries` for unexpected activity.
