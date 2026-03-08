import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-coffee-900 text-warm-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg text-white mb-3">Vibe From Cafe</h3>
            <p className="text-sm text-warm-300">
              Where remote workers vibe, code, and connect — from cafes across Indonesia.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cafes" className="hover:text-white">Cafes</Link></li>
              <li><Link to="/chapters" className="hover:text-white">Chapters</Link></li>
              <li><Link to="/events" className="hover:text-white">Events</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/join" className="hover:text-white">Join</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://x.com/vibefromcafe" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  X (@vibefromcafe)
                </a>
              </li>
              <li>
                <a href="https://instagram.com/vibefromcafe" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Instagram (@vibefromcafe)
                </a>
              </li>
              <li>
                <a href="https://github.com/vibefromcafe" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  GitHub (@vibefromcafe)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-coffee-700 mt-8 pt-6 text-center text-sm text-warm-400">
          Vibe From Cafe &mdash; Made with warmth from Indonesia.
        </div>
      </div>
    </footer>
  );
}
