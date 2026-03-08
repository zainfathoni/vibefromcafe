import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-vfc-black text-vfc-white mt-auto border-t border-vfc-border">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg text-vfc-yellow mb-3">Vibe From Cafe</h3>
            <p className="text-sm text-vfc-muted">
              A community built from cafes across Indonesia, with Vibe Coding as the first active theme.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-vfc-white mb-3">Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cafes" className="text-vfc-muted hover:text-vfc-yellow">Cafes</Link></li>
              <li><Link to="/chapters" className="text-vfc-muted hover:text-vfc-yellow">Chapters</Link></li>
              <li><Link to="/events" className="text-vfc-muted hover:text-vfc-yellow">Events</Link></li>
              <li><Link to="/about" className="text-vfc-muted hover:text-vfc-yellow">About</Link></li>
              <li><Link to="/join" className="text-vfc-muted hover:text-vfc-yellow">Join</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-vfc-white mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://x.com/vibefromcafe" target="_blank" rel="noopener noreferrer" className="text-vfc-muted hover:text-vfc-yellow">
                  X (@vibefromcafe)
                </a>
              </li>
              <li>
                <a href="https://instagram.com/vibefromcafe" target="_blank" rel="noopener noreferrer" className="text-vfc-muted hover:text-vfc-yellow">
                  Instagram (@vibefromcafe)
                </a>
              </li>
              <li>
                <a href="https://github.com/vibefromcafe" target="_blank" rel="noopener noreferrer" className="text-vfc-muted hover:text-vfc-yellow">
                  GitHub (@vibefromcafe)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-vfc-border mt-8 pt-6 text-center text-sm text-vfc-muted">
          Vibe From Cafe &mdash; Made with warmth from Indonesia.
        </div>
      </div>
    </footer>
  );
}
