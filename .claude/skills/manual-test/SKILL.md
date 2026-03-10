---
name: manual-test
description: Run a visual smoke test across all key pages using Chrome DevTools, reporting pass/fail for each.
disable-model-invocation: true
---

# Manual Test

Run a visual smoke test of all key pages on the running app.

## Prerequisites

1. Run `npm run build` to produce a fresh production build
2. Check if wrangler is already running on port 5173:
   - Run `lsof -ti:5173` to check
   - If running, skip starting a new one
   - If not running, start `wrangler pages dev --port 5173` in the background
3. Wait for the server to be ready

## Test plan

For each page below, navigate via Chrome DevTools, take a screenshot, and check for:
- Page renders without errors (no blank screen, no crash)
- Key content is visible (headings, data, forms)
- No console errors (check `list_console_messages` after each page)

### Pages to test

#### Desktop (1280x800)

1. **Homepage** (`/`) — hero section, nav links, top cafes, upcoming events section
2. **Cafes** (`/cafes`) — cafe cards with WiFi speeds and amenities
3. **Events** (`/events`) — event cards with images, dates, locations, tags
4. **Admin** (`/admin`) — submissions table, events management table, "New Event" button
5. **Admin New Event** (`/admin/events/new`) — form with all fields (title, description, date, time, location, etc.)

#### Mobile (375x812, mobile, touch)

6. **Homepage mobile** (`/`) — responsive layout, hamburger menu
7. **Hamburger menu** — click toggle, verify all nav links appear
8. **Events mobile** (`/events`) — event cards stack vertically

## Report

After all tests, produce a summary table:

| # | Page | Viewport | Status | Notes |
|---|------|----------|--------|-------|

Mark each as PASS or FAIL with a brief note on what was observed.
