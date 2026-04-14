import { useEffect, useState, type FormEvent } from "react";
import { NavLink, Outlet } from "react-router";

const ADMIN_USER = "admin";
const ADMIN_PASS = "vfc2025";
const SESSION_KEY = "vfc-admin-authed";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconCoffee({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
    </svg>
  );
}

function IconLogOut({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: "/admin/submissions", label: "Submissions", Icon: IconUsers },
  { to: "/admin/events",      label: "Events",      Icon: IconCalendar },
  { to: "/admin/cafes",       label: "Cafes",       Icon: IconCoffee },
] as const;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-vfc-border bg-vfc-surface">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-vfc-border px-5 py-4">
        <img
          src="/logos/vfc-logo-240.jpg"
          alt="VFC"
          className="h-8 w-8 rounded"
          width={32}
          height={32}
        />
        <div className="leading-tight">
          <p className="text-sm font-bold text-vfc-white">VFC Admin</p>
          <p className="text-[11px] text-vfc-muted">Vibe From Cafe</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-vfc-yellow bg-vfc-yellow/10 text-vfc-yellow"
                  : "border-transparent text-vfc-muted hover:bg-vfc-black/40 hover:text-vfc-white"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-vfc-border p-3">
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-vfc-muted transition-colors hover:bg-red-950/40 hover:text-red-400"
        >
          <IconLogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────

interface LoginFormProps {
  onLogin: (username: string, password: string) => boolean;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ok = onLogin(username, password);
    if (!ok) setError("Invalid username or password.");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-vfc-yellow/30 bg-vfc-yellow/10 p-4">
            <IconLock className="h-7 w-7 text-vfc-yellow" />
          </div>
          <h1 className="text-2xl font-bold text-vfc-white">Admin Access</h1>
          <p className="mt-1.5 text-sm text-vfc-muted">Sign in to manage VFC</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-vfc-border bg-vfc-surface p-6"
        >
          <div>
            <label htmlFor="admin-user" className="mb-1.5 block text-sm font-medium text-vfc-white">
              Username
            </label>
            <input
              id="admin-user"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null); }}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white placeholder-vfc-muted outline-none transition-colors focus:border-vfc-yellow"
              placeholder="Username"
            />
          </div>

          <div>
            <label htmlFor="admin-pass" className="mb-1.5 block text-sm font-medium text-vfc-white">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white placeholder-vfc-muted outline-none transition-colors focus:border-vfc-yellow"
              placeholder="Password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-vfc-yellow py-2.5 font-semibold text-vfc-black transition-colors hover:bg-yellow-300"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  // Mobile tab bar uses the same NAV_ITEMS; no overlay needed — tabs live inline.

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    setReady(true);
  }, []);

  function handleLogin(username: string, password: string): boolean {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  }

  function handleSignOut() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  if (!ready) return null;
  if (!authed) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="flex">
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <div className="sticky top-16 hidden h-[calc(100dvh-4rem)] md:flex">
        <Sidebar onSignOut={handleSignOut} />
      </div>

      {/* ── Content column ────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {/* Mobile tab bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-vfc-border bg-vfc-surface px-2 py-2 md:hidden">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-vfc-yellow/15 text-vfc-yellow"
                    : "text-vfc-muted hover:text-vfc-white"
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-vfc-muted transition-colors hover:text-red-400"
          >
            <IconLogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
