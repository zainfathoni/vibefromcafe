import { Link, NavLink } from "react-router";
import { useEffect, useState } from "react";

const navLinks = [
  { to: "/cafes", label: "Cafes" },
  { to: "/chapters", label: "Chapters" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/join", label: "Join" },
];

type Theme = "dark" | "light";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("vfc-theme");
  return stored === "light" ? "light" : "dark";
}

function SunIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" strokeWidth="2" />
      <path strokeLinecap="round" strokeWidth="2" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("vfc-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center rounded-full border border-vfc-border p-2 text-vfc-muted transition-colors hover:border-vfc-yellow hover:text-vfc-yellow"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-vfc-border bg-vfc-black/95 text-vfc-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logos/vfc-logo-240.jpg"
            srcSet="/logos/vfc-logo-240.jpg 1x, /logos/vfc-logo-480.jpg 2x"
            alt="Vibe From Cafe"
            className="h-10 w-10 rounded"
            width={40}
            height={40}
          />
          <span className="hidden font-semibold tracking-wide sm:block">
            <span className="text-vfc-yellow">VFC</span> Indonesia
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-vfc-yellow text-vfc-black"
                    : "text-vfc-white/80 hover:bg-vfc-surface hover:text-vfc-yellow"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </div>

        {/* Mobile — toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-1 text-vfc-white hover:text-vfc-yellow"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-vfc-border px-4 pb-3 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-vfc-yellow text-vfc-black"
                    : "text-vfc-white/80 hover:bg-vfc-surface hover:text-vfc-yellow"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
