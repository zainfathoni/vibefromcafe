import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";

export const meta: MetaFunction = () => [
  { title: "Chapters — Vibe From Cafe" },
  {
    name: "description",
    content: "Explore Vibe From Cafe theme chapters across Indonesia, starting with Vibe Coding.",
  },
];

export default function Chapters() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-vfc-white mb-2">Chapters</h1>
      <p className="text-vfc-muted mb-10">
        Vibe From Cafe is growing across Indonesia with theme-based chapters. Vibe Coding is the first active one.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Jogja - Active */}
        <Link
          to="/chapters/jogja"
          className="group relative overflow-hidden rounded-xl border-2 border-vfc-border bg-vfc-surface p-6 transition-all hover:border-vfc-yellow"
        >
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full border border-vfc-yellow/40 bg-vfc-yellow/10 px-2.5 py-0.5 text-xs font-medium text-vfc-yellow">
              Active
            </span>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-vfc-white group-hover:text-vfc-yellow">
            Jogja
          </h2>
          <p className="mb-3 text-sm text-vfc-muted">{cafes.length}+ cafes reviewed</p>
          <p className="mb-4 text-sm text-vfc-muted">
            The first VFC chapter. A thriving community of vibe coders in the cultural heart of Java.
          </p>
          <span className="text-sm font-medium text-vfc-yellow">
            Explore Jogja &rarr;
          </span>
        </Link>

        {/* Jakarta - Coming Soon */}
        <div className="rounded-xl border border-dashed border-vfc-border bg-vfc-black p-6 opacity-80">
          <h2 className="mb-2 text-2xl font-bold text-vfc-white/70">Jakarta</h2>
          <p className="mb-3 text-sm text-vfc-muted">Coming soon</p>
          <p className="text-sm text-vfc-muted">
            The capital city's vibe coding scene is booming. We're scouting cafes now.
          </p>
        </div>

        {/* Bandung - Coming Soon */}
        <div className="rounded-xl border border-dashed border-vfc-border bg-vfc-black p-6 opacity-80">
          <h2 className="mb-2 text-2xl font-bold text-vfc-white/70">Bandung</h2>
          <p className="mb-3 text-sm text-vfc-muted">Coming soon</p>
          <p className="text-sm text-vfc-muted">
            Known for its creative scene and cool climate — a natural fit for vibe coders.
          </p>
        </div>
      </div>
    </div>
  );
}
