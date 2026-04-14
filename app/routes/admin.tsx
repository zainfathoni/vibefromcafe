import { useEffect, useState, type FormEvent } from "react";
import { Outlet } from "react-router";

// Client-side gate only — real security is enforced by Cloudflare Access on the /admin path.
const ADMIN_USER = "admin";
const ADMIN_PASS = "vfc2025";
const SESSION_KEY = "vfc-admin-authed";

export default function AdminLayout() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    setReady(true);
  }, []);

  function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setError(null);
    } else {
      setError("Invalid username or password.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setUsername("");
    setPassword("");
  }

  // Avoid a flash of the login screen on initial load
  if (!ready) return null;

  if (!authed) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center justify-center rounded-full border border-vfc-yellow/30 bg-vfc-yellow/10 p-3">
              <svg className="h-6 w-6 text-vfc-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-vfc-white">Admin Access</h1>
            <p className="mt-1 text-sm text-vfc-muted">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="rounded-2xl border border-vfc-border bg-vfc-surface p-6 space-y-4">
            <div>
              <label htmlFor="admin-username" className="mb-2 block text-sm font-medium text-vfc-white">
                Username
              </label>
              <input
                id="admin-username"
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
              <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-vfc-white">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white placeholder-vfc-muted outline-none transition-colors focus:border-vfc-yellow"
                placeholder="Password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

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

  return (
    <div>
      <div className="border-b border-vfc-border bg-vfc-surface px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-xs text-vfc-muted">Admin session active</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md px-3 py-1 text-xs font-medium text-vfc-muted transition-colors hover:text-red-400"
          >
            Sign out
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
