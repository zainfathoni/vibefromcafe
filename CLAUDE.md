# Vibe From Cafe (VFC)

## Stack
- React Router v7 (file-based routing, static export)
- Tailwind CSS v4
- TypeScript
- Cloudflare Pages (static site via `ssr: false`)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Build for production (outputs to build/client)
- `npm run typecheck` — Run typegen + tsc
- No tests yet

## Data
- `app/data/cafes.json` — Cafe directory (55 cafes, all chapter: "jogja")

## Theme
- Coffee/warm/leaf color palette defined in `app/app.css`
- Custom colors: coffee-*, warm-*, leaf-*

## Conventions
- Routes follow React Router v7 file naming in `app/routes/`
- Pages: Home, Cafes, Chapters/Jogja, Events, Join, About
- Static site (no SSR) — deployed to Cloudflare Pages
- Wrangler config in `wrangler.toml`
