# Vibe From Cafe 🍵

A community website for remote workers in Indonesia — find the best cafes with real WiFi speeds, amenities, and community reviews.

**Live site:** [vibefromcafe.id](https://vibefromcafe.id) _(coming soon)_

## Repository status

This repository is the legacy source until the production cutover is complete. The canonical repository is [`vibefromcafe/vibefromcafe`](https://github.com/vibefromcafe/vibefromcafe), and [its issue #1](https://github.com/vibefromcafe/vibefromcafe/issues/1) is the source of truth for migration and cutover readiness.

The former plan to transfer this repository and rename it to `vibefromcafe/web` is superseded. Do not transfer or archive this repository, rename the canonical repository, or change production Cloudflare resources without an explicit decision in the organization tracker.

## Stack

- [React Router v7](https://reactrouter.com/) — file-based routing, static export
- [Tailwind CSS v4](https://tailwindcss.com/) — custom coffee/warm theme
- [TypeScript](https://www.typescriptlang.org/)
- [Cloudflare Pages](https://pages.cloudflare.com/) — static hosting

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (Vite only — no API/KV)
npm run dev

# Start dev server with Cloudflare Functions + local KV
wrangler pages dev
```

Then open [http://localhost:5173](http://localhost:5173).

> **Note:** `npm run dev` runs Vite only — API endpoints (`/api/*`) won't work.
> Use `wrangler pages dev` to test the full stack including Cloudflare Functions and KV.

## Commands

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start Vite dev server (no API/KV)            |
| `wrangler pages dev` | Start full dev server with Functions + KV    |
| `npm run build`      | Build for production → `build/client/`       |
| `npm run typecheck`  | Run type generation + TypeScript check       |
| `npm start`          | Serve the production build locally           |

## Project Structure

```
app/
├── routes/           # Pages (file-based routing)
│   ├── _index.tsx    # Home
│   ├── cafes._index.tsx    # Cafe directory
│   ├── cafes.$slug.tsx     # Cafe detail
│   ├── chapters._index.tsx # Chapters list
│   ├── chapters.jogja.tsx  # Jogja chapter
│   ├── events._index.tsx   # Events
│   ├── join.tsx            # Join page
│   ├── about.tsx           # About
│   └── admin*.tsx          # Admin pages (protected by Cloudflare Access)
├── components/       # Shared components (Nav, Footer, CafeCard)
├── data/
│   ├── cafes.json    # 55 cafes with WiFi speeds & amenities
│   ├── events.json   # Seed events (merged with KV at runtime)
│   └── types.ts      # Cafe and Event type definitions
└── app.css           # Global styles + custom color theme
functions/
└── api/              # Cloudflare Functions (API endpoints)
    ├── events.ts     # Public: GET published events
    └── admin/        # Protected: admin CRUD + submissions
```

## Data

Cafes live in `app/data/cafes.json`. Each cafe has:

```json
{
  "slug": "oddish-family-hub",
  "name": "Oddish Family Hub",
  "chapter": "jogja",
  "map_location": "Jl Umbul Permai",
  "imageUrl": "/events/oddish-family-hub.jpg",
  "mapUrl": "https://maps.app.goo.gl/...",
  "espresso_price": "Rp18.000",
  "wifi_speed": "100",
  "has_ac": true,
  "has_prayer_room": true,
  "quiet_vibes": true,
  ...
}
```

Events can link to a cafe via `cafeId`. When an event doesn't have its own `imageUrl` or `mapUrl`, the linked cafe's values are used as fallbacks.

## Join Flow: WhatsApp Invitation

When new signups submit the join form, the site immediately stores the submission as `invited` and shows the WhatsApp group invite link on the success screen.

Admins can still use the protected **Admin** page to monitor submissions and move members through later states such as `requested_to_join`, `approved`, or `rejected`.

The normal signup status flow is now: `invited` → `requested_to_join` → `approved`.

### Environment Variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `ADMIN_SECRET` | Yes | Secret for admin authentication |
| `WHATSAPP_GROUP_INVITE_URL` | Yes | WhatsApp group invite link (set in Cloudflare dashboard, **encrypt** this) |
| `WHATSAPP_INVITE_MESSAGE_TEMPLATE` | No | Custom message template — supports `{{name}}`, `{{phone}}`, `{{group_link}}` placeholders. Default is set in `wrangler.toml` |

## Deployment

Built for [Cloudflare Pages](https://pages.cloudflare.com/). Config in `wrangler.toml`.

- **Build command:** `npm run build`
- **Output directory:** `build/client`

## Contributing

This site is open source! PRs welcome — especially for:
- Adding cafes to `app/data/cafes.json`
- New city chapters
- UI improvements
