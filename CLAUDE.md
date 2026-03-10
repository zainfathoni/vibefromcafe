# Vibe From Cafe (VFC)

## Stack
- React Router v7 (file-based routing via `flatRoutes()`, static export)
- Tailwind CSS v4
- TypeScript
- Cloudflare Pages (static site via `ssr: false`)
- Vitest + Testing Library for tests

## Commands
- `npm run dev` — Start Vite dev server (no KV/Functions — API calls will fail)
- `wrangler pages dev` — Full dev server with Cloudflare Functions + local KV (requires `npm run build` first)
- `npm run build` — Build for production (outputs to build/client)
- `npm run typecheck` — Run typegen + tsc
- `npm test` — Run Vitest tests

## Data
- `app/data/cafes.json` — Cafe directory (55 cafes, all chapter: "jogja")
- `app/data/events.json` — Seed events (merged with KV-stored events at runtime)
- Form submissions and events stored in Cloudflare KV (`VFC_SUBMISSIONS` binding, namespace ID in `wrangler.toml`)

## Admin
- `/admin` and `/api/admin/*` are protected by **Cloudflare Access** (Zero Trust)
- **Important:** Access must cover **both** `/admin` (SPA page) **and** `/api/admin` (API) paths for **every domain** — production (`vibefromcafe.pages.dev`), custom domain (`vibefromcafe.id`), and preview deployments (`*.vibefromcafe.pages.dev`). Missing the `/api/admin` path on a domain causes "Unauthorized: admin access requires authentication" errors because the middleware won't see the `Cf-Access-Jwt-Assertion` header.
- `functions/api/admin/_middleware.ts` provides defense-in-depth — blocks unauthenticated API requests on any deployment not covered by Access (checks `Cf-Access-Jwt-Assertion` or `X-Admin-Secret` headers)
- Admin events API also requires `X-Admin-Secret` header (checked in `functions/api/admin/auth.ts`)
- Locally there's no Cloudflare Access, so `/admin` is accessible without auth when running `wrangler pages dev`

## Theme
- Dark theme with VFC brand colors defined in `app/app.css`
- Custom colors: `vfc-black`, `vfc-yellow`, `vfc-white`, `vfc-surface`, `vfc-border`, `vfc-muted`

## Git Workflow
- PRs are **squash-merged** into `main`
- **Before creating a PR**, always rebase the feature branch onto `origin/main` so the PR only contains new commits — not commits already squash-merged from a previous PR on the same branch
- Use `git rebase --onto origin/main <last-merged-commit> <branch>` to drop commits that were already merged
- Use `--force-with-lease` (not `--force`) when force-pushing after a rebase

## Conventions
- Routes follow React Router v7 flat routes convention in `app/routes/`
- Pages: Home, Cafes, Chapters/Jogja, Events, Join, About, Admin
- Static site (no SSR) — deployed to Cloudflare Pages
- Wrangler config in `wrangler.toml`
- **Do NOT put non-route files (e.g. CLAUDE.md) in `app/routes/`** — `flatRoutes()` treats every file there as a route

## Routes
- `admin.tsx` is a **layout route** — renders `<Outlet />` for child routes
- `admin._index.tsx` is the **index route** — the admin dashboard content
- Child routes like `admin.events.new.tsx` render inside the layout's `<Outlet />`
- If a route has children, it **must** use `<Outlet />` or child routes won't render
- All pages use client-side `fetch()` in `useEffect` (not loaders) since this is an SPA
- Tests live next to route files (e.g., `admin.test.tsx`) using Testing Library + `vi.stubGlobal("fetch", ...)`
