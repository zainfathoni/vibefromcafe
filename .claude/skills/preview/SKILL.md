---
name: preview
description: Build the app, start wrangler pages dev, and open a page in Chrome DevTools for visual verification.
disable-model-invocation: true
argument-hint: [url-path]
---

# Preview: $ARGUMENTS

Preview the Vibe From Cafe app at the given path (default: `/`).

## Steps

1. Run `npm run build` to produce a fresh production build
2. Check if wrangler is already running on port 5173:
   - Run `lsof -ti:5173` to check
   - If running, skip starting a new one
   - If not running, start `wrangler pages dev --port 5173` in the background
3. Wait a few seconds for the server to be ready, then verify with a quick `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/`
4. Use Chrome DevTools MCP to navigate to `http://localhost:5173$ARGUMENTS` (default to `/` if no argument)
5. Take a screenshot and show the result
6. Report any issues you see in the rendered page

## Notes

- `wrangler pages dev` requires a build first — it serves from `build/client/`
- The app runs on port 5173
- API endpoints (`/api/*`) work with wrangler (unlike `npm run dev`)
- Admin pages (`/admin/*`) are accessible without auth locally
