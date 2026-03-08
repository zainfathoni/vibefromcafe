import { Link, NavLink } from "react-router";
import { useState } from "react";

const navLinks = [
  { to: "/cafes", label: "Cafes" },
  { to: "/chapters", label: "Chapters" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/join", label: "Join" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-vfc-border bg-vfc-black/95 text-vfc-white backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logos/vfc-logo.jpg" alt="Vibe From Cafe" className="h-10 w-auto rounded" />
          <span className="font-semibold tracking-wide hidden sm:block">
            <span className="text-vfc-yellow">VFC</span> Indonesia
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex gap-6">
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
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-vfc-white hover:text-vfc-yellow p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-vfc-border px-4 pb-3">
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
