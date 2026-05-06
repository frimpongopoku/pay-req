# PayReq Registry

## Architecture Map

### App Entry
- `src/app/page.tsx` — redirects root → `/dashboard`
- `src/app/layout.tsx` — global layout + `globals.css`

### Admin Area
- `src/app/(admin)/layout.tsx`
  - Session/role guard
  - Fetches org by `user.orgId`
  - Passes dynamic `orgName` + user props into shell UI
- `src/components/admin/Sidebar.tsx`
  - Dynamic org/user display in brand + profile card
- `src/components/admin/Topbar.tsx`
  - Dynamic breadcrumbs by org
  - Search is intentionally disabled (“coming soon”)

#### Admin Pages
- `/dashboard` → `src/app/(admin)/dashboard/page.tsx`
- `/requests` → `src/app/(admin)/requests/page.tsx`
- `/requests/new` → `src/app/(admin)/requests/new/page.tsx`
- `/requests/[id]` → `src/app/(admin)/requests/[id]/page.tsx`
- `/assets` → `src/app/(admin)/assets/page.tsx`
  - Asset creation modal component:
    - `src/app/(admin)/assets/_components/CreateAssetModal.tsx`
  - Server action:
    - `src/app/(admin)/assets/actions.ts` (`createAsset`)
- `/users` → `src/app/(admin)/users/page.tsx`
- `/insights` → `src/app/(admin)/insights/page.tsx` (data-backed)
- `/settings/slack` → `src/app/(admin)/settings/slack/page.tsx` (mostly static)
- `/settings/org` → `src/app/(admin)/settings/org/page.tsx` (mostly static)

### Employee Area (`/m`)
- `src/app/(mobile)/m/layout.tsx` — session guard + mobile shell
- `/m` → `src/app/(mobile)/m/page.tsx`
- `/m/create` → `src/app/(mobile)/m/create/page.tsx`
- `/m/requests` → `src/app/(mobile)/m/requests/page.tsx`
- `/m/requests/[id]` → `src/app/(mobile)/m/requests/[id]/page.tsx`
- `/m/profile` → `src/app/(mobile)/m/profile/page.tsx`
- `/m/updates` → placeholder
- `/m/pending` → employee-without-org screen

### Auth
- `src/app/auth/signin/page.tsx` — role intent + Google auth
- `src/app/api/auth/session/route.ts` — verify Firebase token, upsert user, claim invite, issue cookie
- `src/app/api/auth/logout/route.ts` — clear cookie
- `src/lib/session.ts` — `getSessionUser()`

### Data Layer
- Contract: `src/lib/db/repository.ts`
- Provider selection: `src/lib/db/index.ts` (defaults to `postgres`)
- Postgres provider: `src/lib/db/providers/postgres.ts`
- Firestore provider: `src/lib/db/providers/firestore.ts`
- Schema migrate API: `src/app/api/db/migrate/route.ts`
- Seed API: `src/app/api/db/seed/route.ts`

### DB Scripts
- `scripts/migrate.mjs` — idempotent SQL migration runner
- npm scripts:
  - `db:migrate`
  - `vercel-build` (runs migrate before build)

## Key Patterns
- Server-first data fetching with client interactivity in `_components`.
- Server actions use `revalidatePath` to sync affected screens.
- Multi-tenant guard: `orgId` is required in admin/mobile gated layouts.
- Assets and requests are org-scoped in repository queries.

## Env Variables
- Firebase client/admin envs still required for auth/session flow.
- `DB_PROVIDER=postgres`
- `DATABASE_URL` set per environment:
  - local: local Postgres
  - deploy: Neon URL

## UX/Implementation Decisions
- Keep search disabled until functional.
- Use subtle performance-safe animations (opacity/transform, short durations, reduced-motion support).
- Manager assignment for assets is constrained to org users with `Admin`/`Manager` role.
- New components/features should prefer **shadcn/ui** over ad-hoc custom components.
