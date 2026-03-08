# Vibe From Cafe 🍵

A community website for remote workers in Indonesia — find the best cafes with real WiFi speeds, amenities, and community reviews.

**Live site:** [vibefromcafe.id](https://vibefromcafe.id) _(coming soon)_

## Stack

- [React Router v7](https://reactrouter.com/) — file-based routing, static export
- [Tailwind CSS v4](https://tailwindcss.com/) — custom coffee/warm theme
- [TypeScript](https://www.typescriptlang.org/)
- [Cloudflare Pages](https://pages.cloudflare.com/) — static hosting

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Commands

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start dev server at localhost:5173           |
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
│   └── about.tsx           # About
├── components/       # Shared components (Nav, Footer, CafeCard)
├── data/
│   └── cafes.json    # 55 cafes with WiFi speeds & amenities
└── app.css           # Global styles + custom color theme
```

## Data

Cafes live in `app/data/cafes.json`. Each cafe has:

```json
{
  "slug": "oddish-family-hub",
  "name": "Oddish Family Hub",
  "chapter": "jogja",
  "map_location": "Jl Umbul Permai",
  "espresso_price": "Rp18.000",
  "wifi_speed": "100",
  "has_ac": true,
  "has_prayer_room": true,
  "quiet_vibes": true,
  ...
}
```

## Deployment

Built for [Cloudflare Pages](https://pages.cloudflare.com/). Config in `wrangler.toml`.

- **Build command:** `npm run build`
- **Output directory:** `build/client`

## Contributing

This site is open source! PRs welcome — especially for:
- Adding cafes to `app/data/cafes.json`
- New city chapters
- UI improvements
