# Cloudflare Functions (API)

## Structure
- `functions/api/events.ts` — Public GET endpoint, returns published events only
- `functions/api/admin/events/index.ts` — Admin GET (list all) and POST (create)
- `functions/api/admin/events/[id].ts` — Admin GET/PUT/DELETE for single event
- `functions/api/admin/auth.ts` — Shared auth helper

## Auth
- `functions/api/admin/_middleware.ts` — **Primary auth gate** for all `/api/admin/*` routes. Requires either a Cloudflare Access JWT (`Cf-Access-Jwt-Assertion` header) or a valid `X-Admin-Secret` header. Allows localhost for local dev. This protects preview deployments that aren't covered by Cloudflare Access.
- `functions/api/admin/auth.ts` — Secondary per-endpoint auth helper. Events endpoints call `requireAdmin(request, env)` for additional `X-Admin-Secret` validation.

## KV bindings
All functions use the `VFC_SUBMISSIONS` KV namespace (bound in `wrangler.toml`). Events use the `event:` key prefix, soft-deletes use `event-deleted:` prefix.

## Dev workflow
- `wrangler pages dev` serves these functions locally with a local KV store
- Requires `npm run build` first (serves the built SPA from `build/client/`)
- `npm run dev` (Vite only) does NOT serve these functions — API calls return HTML 404s
