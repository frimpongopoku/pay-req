# PayReq Registry

## Architecture Map

### App Entry
- `src/app/page.tsx` — redirects root → `/dashboard`
- `src/app/layout.tsx` — global layout + font + globals.css

### Admin Area
- `src/app/(admin)/layout.tsx` — session guard + Driver redirect; passes `userName` to Topbar
- `src/components/admin/Sidebar.tsx` — nav links
- `src/components/admin/Topbar.tsx` — breadcrumbs, user name, sign-out (`userName` prop)
- Pages:
  - `/dashboard` → `(admin)/dashboard/page.tsx`
  - `/requests` → `(admin)/requests/page.tsx` (server) + `_components/RequestsTable.tsx` (client)
  - `/requests/new` → `(admin)/requests/new/page.tsx` (server) + `_components/NewRequestForm.tsx` (client)
  - `/requests/new/actions.ts` — `createRequest`
  - `/requests/[id]` → `(admin)/requests/[id]/page.tsx` (server) + `_components/RequestDetail.tsx` (client)
  - `/requests/[id]/actions.ts` — `advanceStatus`, `rewindStatus`, `denyRequest`
  - `/assets` → `(admin)/assets/page.tsx`
  - `/users` → `(admin)/users/page.tsx`
  - `/insights` → `(admin)/insights/page.tsx` (still static)
  - `/settings/slack` → `(admin)/settings/slack/page.tsx` (still static)
  - `/settings/org` → `(admin)/settings/org/page.tsx` (still static)

### Employee Area (`/m`)
- `src/app/(mobile)/m/layout.tsx` — session guard, StatusBar, TabBar
- `/m` → `(mobile)/m/page.tsx`
- `/m/create` → `(mobile)/m/create/page.tsx` (server) + `_components/CreateForm.tsx` (client)
- `/m/create/actions.ts` — `submitRequest`
- `/m/requests` → `(mobile)/m/requests/page.tsx` (server) + `_components/RequestsList.tsx` (client)
- `/m/requests/[id]` → `(mobile)/m/requests/[id]/page.tsx`
- `/m/profile` → `(mobile)/m/profile/page.tsx` (server) + `_components/SignOutButton.tsx` (client)
- `/m/updates` → placeholder
- `/m/dashboard` → redirects to `/m`

### Onboarding
- `src/app/onboarding/page.tsx` — server guard (redirects if already has org)
- `src/app/onboarding/_components/OnboardingForm.tsx` — client form
- `src/app/onboarding/actions.ts` — `createOrganisation` (creates org, sets user orgId + Admin role)
- `src/app/(mobile)/m/pending/page.tsx` — employee without org (outside mobile layout group, no loop)
- `src/app/(mobile)/m/pending/_components/PendingSignOut.tsx` — client sign-out

### Auth
- `src/app/auth/signin/page.tsx` — role picker (Admin/Manager vs Employee) + Google auth + redirect by intent+orgId
- `src/app/api/auth/session/route.ts` — verify token, upsert user, create cookie, return role
- `src/app/api/auth/logout/route.ts` — clear cookie
- `src/lib/session.ts` — `getSessionUser()` (React cache-wrapped)
- `src/lib/firebase-client.ts` — client Firebase app
- `src/lib/firebase-admin.ts` — `getAdminApp()`, `getAdminAuth()`

### Data Layer
- `src/lib/db/types.ts` — domain types (source of truth)
- `src/lib/db/repository.ts` — `IRepository` (Postgres swap point)
- `src/lib/db/providers/firestore.ts` — `FirestoreRepository`
- `src/lib/db/index.ts` — `getDb()` factory
- `src/app/api/db/seed/route.ts` — `POST /api/db/seed` (dev only)
- `src/lib/data.ts` — mock seed data (imports types from db/types, re-exports for compat)

### UI Atoms
- `src/components/ui/icons.tsx` — `I` (admin), `MI` (mobile)
- `src/components/ui/Pill.tsx` — `Pill` (admin), `MPill` (mobile)
- `src/components/ui/Avatar.tsx`
- `src/components/ui/Spark.tsx`
- `src/app/globals.css` — all styles

## Key Patterns
- **Server + Client split**: server fetches data, client handles interactivity. All `_components/` dirs.
- **Server actions**: `actions.ts` with `'use server'`, call `getDb()` + `revalidatePath()`.
- **Current user**: always `getSessionUser()` from `src/lib/session.ts`.
- **User request filter**: `r.requesterUid === user.id || r.requester === user.name`.

## Env Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `DB_PROVIDER` (default: `firestore`)

## Notes
- Seeded users have name-slug IDs (`maya-patel`). Real auth users get Firebase UID.
- Service-account key needs rotation.
- `/m/updates` is placeholder only.
