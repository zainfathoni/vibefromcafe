# Routes

## Routing convention
Uses `flatRoutes()` from `@react-router/fs-routes` (configured in `app/routes.ts`).

### Layout vs index routes
- `admin.tsx` is a **layout route** — it renders `<Outlet />` for child routes
- `admin._index.tsx` is the **index route** — the admin dashboard content
- Child routes like `admin.events.new.tsx` and `admin.events.$id.edit.tsx` render inside the layout's `<Outlet />`
- If a route has children, it **must** use `<Outlet />` or child routes won't render

### Active nav highlighting
The nav component in `root.tsx` highlights the current route. The `Events` link is included in the nav.

## Client-side data fetching
All pages use client-side `fetch()` in `useEffect` (not loaders) since this is an SPA (`ssr: false`). Each page manages its own loading/error/empty states.

## Testing
Tests live next to route files (e.g., `admin.test.tsx`). They use `@testing-library/react` with `MemoryRouter` and mock `fetch` via `vi.stubGlobal`.
