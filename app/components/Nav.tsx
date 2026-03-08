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
    <nav className="bg-coffee-800 text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <img src="/logos/vfc-logo.jpg" alt="Vibe Coding From Cafe" className="h-10 w-auto rounded" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium hover:text-warm-300 ${
                  isActive ? "text-warm-300" : "text-warm-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-warm-100 p-1"
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
        <div className="md:hidden border-t border-coffee-700 px-4 pb-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium hover:text-warm-300 ${
                  isActive ? "text-warm-300" : "text-warm-100"
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
