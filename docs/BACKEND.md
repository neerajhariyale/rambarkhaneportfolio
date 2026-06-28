# Ram Barkhane — Dynamic Backend (Supabase)

The site is a Vite + React SPA backed by Supabase (Postgres + Auth + Storage).

## Admin portal

- URL: `/admin` (login at `/admin/login`)
- Login is by **username or email** + password of an allowlisted admin.
  A bare username (no `@`) maps to `<username>@rambarkhane.app`; a full email is
  used as-is. Current admins (both password `ram@2026` — change these):
  - `admin-ram`  (→ `admin-ram@rambarkhane.app`)
  - `rambarkhane9371@gmail.com`
- Pages: Dashboard (visitor analytics), Artworks (CRUD + image upload),
  Collections (CRUD + featured), Inquiries (leads with source + status)

### Add / change an admin

Admins are an allowlist in the `app_admins` table — being merely authenticated is
not enough. To add one:

1. Create the auth user (Supabase Dashboard → Authentication → Add user).
2. Add their email: `insert into app_admins (email) values ('them@example.com');`

To change a password: Supabase Dashboard → Authentication → user → "Send reset",
or set a new one there. (Note: the two starter admins were created directly in
the DB with bcrypt because Supabase's signup validator rejected the synthetic
`.app` domain — resetting via the dashboard works normally from here.)

## Environment (`.env.local`, git-ignored)

```
VITE_SUPABASE_URL=...          # public, shipped to browser
VITE_SUPABASE_ANON_KEY=...     # publishable key, public
SUPABASE_DB_HOST / PORT / USER / NAME / PASSWORD   # migrations only, never bundled
ADMIN_EMAIL / ADMIN_PASSWORD   # used once by the seed script
```

`.env.example` documents the shape. **Never commit `.env.local`.**

## Migrations

SQL lives in `supabase/migrations/`. Apply with psql:

```bash
set -a; . ./.env.local; set +a
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$SUPABASE_DB_HOST" -p "$SUPABASE_DB_PORT" \
  -U "$SUPABASE_DB_USER" -d "$SUPABASE_DB_NAME" -f supabase/migrations/0001_init.sql
```

(or paste the file into the Supabase SQL Editor.)

## Seed starter data

```bash
node --env-file=.env.local scripts/seed.mjs
```

Uploads the bundled images to Storage and inserts the 12 starter artworks.
Idempotent: skips if artworks already exist.

## Data model

- `collections` — public read, admin write. `is_featured` flags the featured collection.
- `artworks` — public read, admin write. `image_url` points at Storage. `collection_id` FK.
- `visits` — anyone may INSERT (a page view); only admins may read. Captures
  source / referrer / utm / device / session.
- `leads` — anyone may INSERT (an inquiry event); only admins may read/update.
  Logged when a visitor taps Inquire / WhatsApp / Commission, with the on-site source.

The frontend reads the catalog via `src/lib/catalog.js`, falling back to the
bundled static data if Supabase is unreachable or empty.

## Security notes

- All admin access is gated by `public.is_admin()` (email must be in `app_admins`),
  so a stray public signup gains **no** access.
- Recommended: Supabase → Authentication → Providers → disable public sign-ups
  (defense in depth) and keep email confirmation on.
- `visits` / `leads` allow anonymous INSERT by design (client-side tracking).
  Consider a rate limit / Turnstile if spam ever becomes an issue.
- **Rotate the database password** — it was shared in plaintext during setup.

## Deployment

It's an SPA, so the host must rewrite all paths to `index.html` (else `/admin`
404s on refresh). Configs included: `vercel.json` (Vercel) and `public/_redirects`
(Netlify). Set the `VITE_*` env vars in the host dashboard.
