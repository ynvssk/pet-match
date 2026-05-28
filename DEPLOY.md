# Deploying PetMatch to Supabase + Vercel

The code is already deployment-ready:
- Prisma uses a **pooled** connection at runtime (`DATABASE_URL`) and a **direct** connection for migrations (`DIRECT_URL`).
- Photo uploads automatically use **Supabase Storage** when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set (local dev still uses disk when they're blank).
- `npm run build` runs `prisma migrate deploy` then `next build`, so tables are created on each deploy.

You'll do three things: set up Supabase, push to GitHub, import into Vercel.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com> → **New project**. Pick a name, a strong DB password (save it), and a region close to you.
2. Wait for it to provision (~2 min).

### Get the connection strings
**Project Settings → Database → Connection string → "URI" tab.** You need two:

- **Pooled / Transaction** (for `DATABASE_URL`): toggle **Connection pooling → Transaction**. Looks like:
  ```
  postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
  ```
  Append `?pgbouncer=true&connection_limit=1` to it.

- **Direct** (for `DIRECT_URL`): the un-pooled string, port **5432**:
  ```
  postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
  ```
  (or the `db.<ref>.supabase.co:5432` form — either works)

Replace `<password>` with your DB password in both.

### Get the storage credentials
**Project Settings → API:**
- `SUPABASE_URL` = the **Project URL** (`https://<ref>.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` = the **service_role** secret key (NOT the anon key)

### Create the storage bucket
**Storage → New bucket:**
- Name: `pet-photos`
- **Public bucket: ON** (so photo URLs load without signed tokens)

---

## 2. Seed the Supabase database (once, from your machine)

The Vercel build creates the tables but doesn't seed demo data. Run this locally pointed at Supabase's **direct** URL:

**PowerShell:**
```powershell
$env:DATABASE_URL="<your DIRECT 5432 url>"
$env:DIRECT_URL="<your DIRECT 5432 url>"
npm run db:deploy   # creates tables
npm run db:seed     # 30 pets, 11 events, venues, pre-RSVPs
```
(Use the **direct** 5432 URL for seeding — the pooler can choke on bulk inserts.)

When done, close that terminal so your local `.env` (Docker) is used again for local dev.

---

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "PetMatch MVP"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/pet-match.git
git branch -M main
git push -u origin main
```
`.env`, `.env.local`, `node_modules`, and `uploads/` are already gitignored, so no secrets get pushed.

---

## 4. Import into Vercel

1. <https://vercel.com> → **Add New → Project** → import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave build/output settings default.
3. **Environment Variables** — add all of these (Production + Preview):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | pooled 6543 URL + `?pgbouncer=true&connection_limit=1` |
   | `DIRECT_URL` | direct 5432 URL |
   | `JWT_SECRET` | a fresh random 32+ char string |
   | `SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `SUPABASE_STORAGE_BUCKET` | `pet-photos` |

   Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. Click **Deploy**. The build runs `prisma migrate deploy` (tables already exist from step 2, so it's a no-op) then `next build`.
5. Open the `*.vercel.app` URL. Sign in with any phone + OTP `0000`.

---

## Notes & gotchas

- **Cookies**: in production the session cookie is `Secure`; Vercel serves HTTPS so this just works.
- **Mock auth is wide open**: anyone with the URL can sign in as any phone (OTP `0000`). Fine for a demo — add a real OTP provider or a passphrase gate before any real launch.
- **Photos**: existing local `uploads/` files are NOT migrated. Seeded pets use `placedog.net` URLs which work anywhere. New uploads on the deployed site go to Supabase Storage.
- **Schema changes later**: commit the new migration (from `npx prisma migrate dev` locally) and push — Vercel's build applies it via `prisma migrate deploy`.
- **Connection limits**: the `connection_limit=1` on the pooled URL is important for serverless — each Vercel function gets its own connection, and the pooler fans them out.

---

## Quick troubleshooting

| Symptom | Fix |
|---|---|
| Build fails `P1001 can't reach database` | `DIRECT_URL` wrong/unreachable; check password + port 5432 |
| App loads but every page errors about missing tables | You skipped step 2 seed / migrate; run `npm run db:deploy` against the direct URL |
| Uploaded photos 404 | Bucket isn't **public**, or `SUPABASE_*` env vars missing in Vercel |
| `prepared statement already exists` during seed | You seeded via the pooled URL — re-run using the **direct** 5432 URL |
