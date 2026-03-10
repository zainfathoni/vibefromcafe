# Data Layer

## Types (`types.ts`)
- `Cafe` — cafe directory entry (slug, name, chapter, amenities, wifi speed, optional imageUrl/mapUrl)
- `Event` — community event (title, date, time, location, cafeId, imageUrl, mapUrl, tags, status)
- `EventStatus` — `"published"` | `"draft"` (only published events show on public page)

## Cafes (`cafes.json`)
Static JSON, 55 cafes, all in the "jogja" chapter. Read directly by route components. Cafes can optionally have `imageUrl` and `mapUrl` — these serve as fallbacks for linked events that don't specify their own.

## Events
- **Seed data** in `events.json` — checked into the repo, merged with KV at runtime
- **Runtime store** in `events-store.ts` — reads/writes to Cloudflare KV with `event:` prefix
- Seed events can be overridden by KV entries with the same ID, or soft-deleted via `event-deleted:` prefix
- Events are sorted by date/time ascending

## Validation (`event-validation.ts`)
- `parseEventInput(body, requireAllFields)` — validates and normalizes event input
- `requireAllFields: true` for POST (create), `false` for PUT (partial update)
- Returns `{ input }` on success or `{ error }` on failure

## Event form (`event-form.ts`)
Shared form type used by both the create and edit admin routes. String-based (tags are comma-separated), converted to the API payload on submit.
