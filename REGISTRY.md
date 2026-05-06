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
  - Search is intentionally disabled ("coming soon")

#### Admin Pages
- `/dashboard` → `src/app/(admin)/dashboard/page.tsx`
- `/requests` → `src/app/(admin)/requests/page.tsx`
- `/requests/new` → `src/app/(admin)/requests/new/page.tsx`
  - Page passes `assets`, `vendors` (past payees), `currency` (from org) to form
  - `_components/NewRequestForm.tsx` — deferred FileUpload via `fileRef`, vendor datalist, currency label
  - `actions.ts` → `createRequest` — reads `currency` from FormData
- `/requests/[id]` → `src/app/(admin)/requests/[id]/page.tsx`
- `/assets` → `src/app/(admin)/assets/page.tsx`
  - Asset cards show type icon (colored by type), type chip, tags chips
  - `_components/CreateAssetModal.tsx` — type selector (car/building/device/machine/other), type-specific fields, tag chip input, optional manager assignment
  - `actions.ts` → `createAsset` — saves type, details (JSONB), tags (TEXT[]), managers
- `/users` → `src/app/(admin)/users/page.tsx`
- `/insights` → `src/app/(admin)/insights/page.tsx` (data-backed)
- `/settings/slack` → `src/app/(admin)/settings/slack/page.tsx` (mostly static)
- `/settings/org` → `src/app/(admin)/settings/org/page.tsx`
  - Loads real org from DB
  - `_components/OrgSettingsForm.tsx` — name + currency picker (saves via server action)
  - `actions.ts` → `saveOrgSettings` — calls `db.updateOrg()`

### Employee Area (`/m`)
- `src/app/(mobile)/m/layout.tsx` — session guard + mobile shell (status bar shows only battery)
- `/m` → `src/app/(mobile)/m/page.tsx`
- `/m/create` → `src/app/(mobile)/m/create/page.tsx`
  - Passes `assets`, `vendors` (employee's own past payees), `currency` to form
  - `_components/CreateForm.tsx` — deferred FileUpload (preview only until submit), vendor datalist, currency display
  - `actions.ts` → `submitRequest` — reads `currency` from FormData
- `/m/requests` → `src/app/(mobile)/m/requests/page.tsx`
- `/m/requests/[id]` → `src/app/(mobile)/m/requests/[id]/page.tsx`
  - Reviewer shows "All admins" when no managers assigned
  - Submitted note shows manager names or "Reviewable by all admins"
- `/m/profile` → `src/app/(mobile)/m/profile/page.tsx`
- `/m/updates` → placeholder
- `/m/pending` → employee-without-org screen

### Auth
- `src/app/auth/signin/page.tsx` — role intent + Google auth
- `src/app/api/auth/session/route.ts` — verify Firebase token, upsert user, claim invite, issue cookie
- `src/app/api/auth/logout/route.ts` — clear cookie
- `src/lib/session.ts` — `getSessionUser()`

### Data Layer
- Contract: `src/lib/db/repository.ts` — `IRepository` interface (includes `updateOrg`)
- Types: `src/lib/db/types.ts` — `Organisation` has `currency: string`; `Asset` has `type`, `details`, `tags`; `AssetType` union
- Provider selection: `src/lib/db/index.ts` (defaults to `postgres`)
- Postgres provider: `src/lib/db/providers/postgres.ts`
  - Pool cached on `global.__pgPool` (max 10 connections) — survives HMR, prevents "too many clients"
  - `rowToOrg` reads `currency` (defaults 'GHS')
  - `rowToAsset` reads `type`, `details` (JSONB), `tags`
  - `updateOrg(id, patch)` — partial update via snake_case mapper
- Firestore provider: `src/lib/db/providers/firestore.ts` — stub `updateOrg` implemented
- Schema migrate API: `src/app/api/db/migrate/route.ts`
  - Adds `IF NOT EXISTS`: organisations.currency, assets.type, assets.details, assets.tags
- Seed API: `src/app/api/db/seed/route.ts`

### UI Components
- `src/components/ui/icons.tsx` — `I` (desktop 16px) and `MI` (mobile 20px) icon maps (lucide-react)
  - Includes: car, building, device (Laptop), machine (Cog), package icons
- `src/components/ui/FileUpload.tsx` — **forwardRef** component
  - `deferred` prop: shows local preview via `URL.createObjectURL()`, exposes `uploadAll(): Promise<string[]>` via ref
  - Non-deferred (default): uploads immediately on file selection (existing behavior)
  - `variant="mobile"` for mobile styling
- `src/components/ui/select.tsx` — shadcn Select
- `src/components/ui/popover.tsx` — shadcn Popover
- `src/components/ui/calendar.tsx` — shadcn Calendar (react-day-picker v9)
- `src/components/ui/button.tsx` — shadcn Button
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge)

#### CSS custom classes (globals.css)
- `.field-select-trigger` / `.field-date-trigger` — admin form inputs matching design
- `.m-select-trigger` / `.m-date-trigger` — mobile form inputs
- `.modal-panel.asset-modal` — wider (600px) scrollable modal for asset creation
- Mobile interaction classes: hover lift on `.m-req`, `.m-quick .a`; stagger animation on `.m-req-list`; press states on tab bar, icon buttons, CTA

#### Key patterns
- **Vendor suggestions**: derived from past `requests.payee` values at page load, passed as `vendors: string[]`, rendered as `<datalist>` — no new table
- **Asset managers**: only Manager-role users shown in picker; admins manage all assets by default; field is optional
- **Currency**: loaded from `org.currency` at page level, passed to forms as prop, written to `requests.currency` on submit
</content>
</invoke>