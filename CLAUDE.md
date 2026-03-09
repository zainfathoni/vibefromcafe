# Vibe From Cafe (VFC)

## Stack
- React Router v7 (file-based routing, static export)
- Tailwind CSS v4
- TypeScript
- Cloudflare Pages (static site via `ssr: false`)

## Commands
- `npm run dev` — Start dev server (Vite only, no KV/Functions)
- `wrangler pages dev` — Start dev server with Cloudflare Functions + local KV
- `npm run build` — Build for production (outputs to build/client)
- `npm run typecheck` — Run typegen + tsc
- No tests yet

## Data
- `app/data/cafes.json` — Cafe directory (55 cafes, all chapter: "jogja")
- Form submissions stored in Cloudflare KV (`VFC_SUBMISSIONS` binding, namespace ID in `wrangler.toml`)
- Locally, `npm run dev` won't have KV — API calls to `/api/*` will fail. Use `wrangler pages dev` instead.

## Admin
- `/admin` and `/api/admin/*` are protected by **Cloudflare Access** (Zero Trust) — configured at the dashboard level, not in code
- Locally there's no Cloudflare Access, so `/admin` is accessible without auth when running `wrangler pages dev`

## Theme
- Coffee/warm/leaf color palette defined in `app/app.css`
- Custom colors: coffee-*, warm-*, leaf-*

## Conventions
- Routes follow React Router v7 file naming in `app/routes/`
- Pages: Home, Cafes, Chapters/Jogja, Events, Join, About
- Static site (no SSR) — deployed to Cloudflare Pages
- Wrangler config in `wrangler.toml`
