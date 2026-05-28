# PetMatch MVP

A mobile-first pet-parent matching app built with Next.js 15 + Postgres. Walks the full happy flow from signup → profile → discovery → match → chat → meetup, with auth, chat replies, and venue suggestions all mocked so the flow can be validated without external services.

## Tech stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS, installable as a PWA
- **Backend:** Next.js API routes + Prisma ORM
- **Database:** PostgreSQL 16 in Docker
- **Auth:** Phone + OTP (mocked — code is always `0000`), JWT in httpOnly cookie
- **Chat:** Canned auto-replies (no real-time infra)
- **Photos:** Local disk under `./uploads/`

## Prerequisites

You need these installed on the machine that will run the app:

1. **Node.js 22+** — `winget install OpenJS.NodeJS.LTS`
2. **Docker Desktop** — `winget install Docker.DockerDesktop` (a reboot is required after install)

On Mac/Linux, install Node.js + Docker via Homebrew or your distro's package manager.

## First-time setup

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install dependencies
npm install

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Seed demo users, pets, and venues
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone (same Wi-Fi network — use your machine's LAN IP) or desktop. Sign in with any phone number; OTP is always `0000`.

## Sharing this app with others to run locally

Anyone you share the repo with just needs:

1. Node.js 22+ and Docker Desktop installed
2. Clone the repo
3. Run the five commands under "First-time setup" above

The `docker-compose.yml` makes the database setup portable — no native Postgres install needed on each recipient's machine.

## Daily commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server on `:3000` |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run db:migrate` | Apply schema changes |
| `npm run db:seed` | Reseed demo data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) at `:5555` |
| `npm run db:reset` | Wipe DB and re-run migrations + seed |
| `docker compose up -d` | Start Postgres |
| `docker compose down` | Stop Postgres (keeps data) |
| `docker compose down -v` | Stop Postgres and wipe data volume |

## Project layout

```
pet-mate-app/
├── docker-compose.yml          # Postgres service
├── prisma/
│   ├── schema.prisma           # DB schema (Users, Pets, Likes, Matches, Messages, Meetups, Venues, Blocks, Reports)
│   └── seed.ts                 # Demo data
├── public/                     # Static assets, PWA manifest, icons
├── uploads/                    # User-uploaded pet photos (gitignored)
└── src/
    ├── middleware.ts           # Auth gate (JWT cookie)
    ├── app/
    │   ├── (auth)/             # /login, /verify
    │   ├── onboarding/         # /onboarding/profile, /onboarding/pet
    │   ├── (app)/              # /discover, /matches, /chat, /meetup, /profile, /pet/[id]/edit
    │   └── api/                # All backend routes
    ├── components/             # SwipeCard, MatchModal, PhotoUploader, BottomNav, ui/*
    └── lib/                    # db, auth, session, validators, autoReply, utils
```

## Walking the happy flow

To verify everything works end-to-end, open two browsers (or incognito windows):

1. **Window A:** Sign in as `+91 90000 00001` / OTP `0000`. Name "Alice", city Bangalore. Add pet "Bruno", Golden Retriever, with photos.
2. **Window B:** Sign in as `+91 90000 00002` / OTP `0000`. Name "Bob", city Bangalore. Add pet "Max", Labrador.
3. **Window A:** Discover → like Max.
4. **Window B:** Discover → like Bruno → **match modal fires immediately**.
5. Either window: open chat, send "Hi!" → an auto-reply lands ~1s later.
6. Open Meetup → propose a Bangalore venue.
7. **Window A:** Edit Bruno → swap a photo, change temperament → reload Window B's Discover (you'll need a fresh swipe, since you already actioned that pet) and verify changes.

Spot-check rows in `npm run db:studio` under `User`, `Pet`, `Like`, `Match`, `Message`, `Meetup`.

## MVP scope notes — things deliberately mocked

| PRD requirement | MVP behavior | Production replacement |
|---|---|---|
| Phone OTP (FR-AUTH-1/2) | Code `0000` always works | Twilio Verify / MSG91 |
| Google/Apple login | Not built | NextAuth.js / Clerk |
| Real-time chat (FR-CHAT-2) | Canned auto-reply per send | WebSockets (Pusher/Ably) |
| Read receipts (FR-CHAT-3) | `readAt` updated on GET, no live UI | Same as real-time |
| Nearby pets / distance (FR-DISC-1) | City-string match only | PostGIS + Haversine |
| Push notifications (Sec 9) | None | Web Push (VAPID) + FCM |
| Photo storage | Local disk `./uploads/` | S3 / Cloudflare R2 |
| Venue suggestions (FR-MEET-2) | Hardcoded `Venue` table per city | Google Places API |
| Account deletion (FR-AUTH-5) | Hard delete cascades pets/matches/messages | Same, or soft delete with retention |
| Analytics (Sec 13) | Not wired | PostHog / Mixpanel |
| NFRs: <3s launch, <500ms chat | Not measured | Lighthouse, real-user monitoring |

## Resetting everything

```bash
docker compose down -v   # wipe Postgres data
rm -rf uploads/*         # wipe user photos
docker compose up -d
npx prisma migrate dev
npm run db:seed
```
