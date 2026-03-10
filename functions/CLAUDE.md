# Cloudflare Functions (API)

## Structure
- `functions/api/events.ts` — Public GET endpoint, returns published events only
- `functions/api/admin/events/index.ts` — Admin GET (list all) and POST (create)
- `functions/api/admin/events/[id].ts` — Admin GET/PUT/DELETE for single event
- `functions/api/admin/auth.ts` — Shared auth helper

## Auth
Admin endpoints call `requireAdmin(request, env)` from `auth.ts`, which checks the `X-Admin-Secret` header against `env.ADMIN_SECRET`. In production, Cloudflare Access provides an additional layer.

## KV bindings
All functions use the `VFC_SUBMISSIONS` KV namespace (bound in `wrangler.toml`). Events use the `event:` key prefix, soft-deletes use `event-deleted:` prefix.

## Dev workflow
- `wrangler pages dev` serves these functions locally with a local KV store
- Requires `npm run build` first (serves the built SPA from `build/client/`)
- `npm run dev` (Vite only) does NOT serve these functions — API calls return HTML 404s
