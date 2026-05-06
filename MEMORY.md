# PayReq Memory

## Current State (May 6, 2026)
Postgres-first multi-tenant app is running locally and build-clean. Core admin + employee flows are working end-to-end.

## Architecture Direction
- **Primary DB**: Postgres (`DB_PROVIDER=postgres`).
- Local development uses local Postgres via `DATABASE_URL`.
- Deployment target uses Neon by setting deployment `DATABASE_URL`.
- Firestore auth/session integration still exists for Firebase Auth verification and client auth.

## Database & Deployment Decisions
- `getDb()` defaults to Postgres when `DB_PROVIDER` is unset.
- Added migration runner script: `scripts/migrate.mjs`.
- Added npm scripts:
  - `db:migrate`
  - `vercel-build` (`npm run db:migrate && next build`) for auto-migrate on Vercel build.
- Local migration executed successfully against:
  - `postgresql://postgres:postgres@localhost:5432/pay-req`

## Data Layer Notes
- Repository contract remains in `src/lib/db/repository.ts`.
- Postgres provider is active and supports orgs, users, assets, requests, activity, invites.
- Dev seed route is now repository-driven for activity too (no Firestore-only activity writes).

## Admin UX Changes (latest)
- Org name is dynamic in admin shell (no hardcoded “Northbound Freight” in top nav/sidebar).
- `/assets` now supports **real asset creation** via server action.
- Asset creation uses a **modal** (`CreateAssetModal`) instead of inline details.
- Asset managers are selected from live org users with roles `Admin` or `Manager`.
- Navbar search is explicitly disabled (“Search coming soon”) until implemented.
- Added lightweight, low-jank animations for modal and asset cards with reduced-motion fallback.

## Product Rule (must persist)
- For new features/components, prefer **shadcn/ui** components instead of ad-hoc custom component builds.

## Known Open Work
- Slack integration is still mostly static UI.
- Organization settings page is mostly static UI.
- `/m/updates` remains placeholder.
- Consider full Firebase-to-Postgres auth profile ownership later if desired.
