# PayReq Memory

## Current State (May 5, 2026)
Full multi-tenant onboarding flow live. All admin and employee features working end-to-end.

## Auth & Onboarding Flow
- Sign-in at `/auth/signin` — user picks role (Admin/Manager vs Employee) before Google auth.
- Session API returns `{ role, orgId }` after upserting user in Firestore.
- **Admin path**: orgId present → `/dashboard`. No orgId → `/onboarding` (create org).
- **Employee path**: orgId present → `/m`. No orgId → `/m/pending` (not added yet).
- Both layouts enforce org check as fallback (loop-safe: `/m/pending` is outside `(mobile)` layout group).
- `getSessionUser()` in `src/lib/session.ts` — React cache-wrapped. Use everywhere.

## Organisation Model
- `Organisation`: `{ id, name, ownerUid, createdAt }` in Firestore `orgs` collection.
- `User.orgId?: string` — set when user joins/creates an org.
- On org creation: creator gets `role: 'Admin'` and `orgId` set in Firestore.
- Employees get orgId when an admin adds them (manual Firestore edit for now — invite flow is future work).

## Data Layer
- `IRepository` in `src/lib/db/repository.ts` — Postgres swap point.
- `getDb()` — only import pages need. `DB_PROVIDER=postgres` to swap.
- New methods: `createOrg`, `getOrg`, `listUsersByOrg`.
- Seed: `POST /api/db/seed` (dev only).
- NOTE: seeded data has no `orgId` — works fine in dev but will be invisible to org-scoped queries when added later.

## Request Model
- `requesterUid?: string` — set on all new requests.
- Filter user's requests: `r.requesterUid === user.id || r.requester === user.name`.

## Admin Pages (all live, Firestore-backed)
- `/dashboard`, `/requests`, `/requests/new`, `/requests/[id]`, `/assets`, `/users`

## Employee Pages (all live, Firestore-backed)
- `/m`, `/m/create`, `/m/requests`, `/m/requests/[id]`, `/m/profile`
- `/m/pending` — employee without org (outside mobile layout, no redirect loop)

## Server Actions
- `/onboarding/actions.ts` — `createOrganisation`
- `/requests/new/actions.ts` — `createRequest`
- `/m/create/actions.ts` — `submitRequest`
- `/requests/[id]/actions.ts` — `advanceStatus`, `rewindStatus`, `denyRequest`

## Environment
- `.env.local`: all Firebase credentials set.
- Service-account key needs rotation.

## Next Up
- Org-scoped data queries (filter requests/assets by orgId)
- Admin invite/add employee flow (currently manual Firestore edit)
- Slack integration
- Insights page
- File attachments
