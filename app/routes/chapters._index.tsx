import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";

export const meta: MetaFunction = () => [
  { title: "Chapters — Vibe From Cafe" },
  {
    name: "description",
    content: "Vibe From Cafe chapters across Indonesia. Find your local community.",
  },
];

export default function Chapters() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-coffee-800 mb-2">Chapters</h1>
      <p className="text-coffee-500 mb-10">
        Vibe From Cafe is growing across Indonesia. Find your local chapter or start one.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Jogja - Active */}
        <Link
          to="/chapters/jogja"
          className="bg-white rounded-xl border-2 border-coffee-200 shadow-sm hover:shadow-md transition-all p-6 group relative overflow-hidden"
        >
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-leaf-500/10 text-leaf-600 border border-leaf-500/20">
              Active
            </span>
          </div>
          <h2 className="text-2xl font-bold text-coffee-800 group-hover:text-coffee-600 mb-2">
            Jogja
          </h2>
          <p className="text-coffee-400 text-sm mb-3">{cafes.length}+ cafes reviewed</p>
          <p className="text-coffee-500 text-sm mb-4">
            The first VFC chapter. A thriving community of remote workers in the cultural heart of Java.
          </p>
          <span className="text-sm font-medium text-coffee-600 group-hover:text-coffee-800">
            Explore Jogja &rarr;
          </span>
        </Link>

        {/* Jakarta - Coming Soon */}
        <div className="bg-coffee-50 rounded-xl border border-dashed border-coffee-200 p-6 opacity-70">
          <h2 className="text-2xl font-bold text-coffee-600 mb-2">Jakarta</h2>
          <p className="text-coffee-400 text-sm mb-3">Coming soon</p>
          <p className="text-coffee-400 text-sm">
            The capital city's remote work scene is booming. We're scouting cafes now.
          </p>
        </div>

        {/* Bandung - Coming Soon */}
        <div className="bg-coffee-50 rounded-xl border border-dashed border-coffee-200 p-6 opacity-70">
          <h2 className="text-2xl font-bold text-coffee-600 mb-2">Bandung</h2>
          <p className="text-coffee-400 text-sm mb-3">Coming soon</p>
          <p className="text-coffee-400 text-sm">
            Known for its creative scene and cool climate — a natural fit for remote workers.
          </p>
        </div>
      </div>
    </div>
  );
}
