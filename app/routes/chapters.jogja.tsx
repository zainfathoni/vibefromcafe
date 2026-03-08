import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";
import CafeCard from "../components/CafeCard";
import type { Cafe } from "../data/types";

export const meta: MetaFunction = () => [
  { title: "Jogja Chapter — Vibe Coding From Cafe" },
  {
    name: "description",
    content:
      "Vibe Coding From Cafe Jogja — the first chapter. Discover the best cafes for vibe coding in Yogyakarta.",
  },
];

export default function ChapterJogja() {
  const jogjaCafes = (cafes as Cafe[]).filter((c) => c.chapter === "jogja");
  const topCafes = [...jogjaCafes]
    .filter((c) => c.wifi_speed)
    .sort((a, b) => {
      const speedA = parseFloat((a.wifi_speed ?? "0").split(":")[0]);
      const speedB = parseFloat((b.wifi_speed ?? "0").split(":")[0]);
      return speedB - speedA;
    })
    .slice(0, 6);

  return (
    <div>
      {/* Hero Banner */}
      <div className="w-full mb-8">
        <img
          src="/logos/vfc-jogja-banner.jpg"
          alt="Vibe Coding From Cafe — Chapter Yogyakarta"
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4">
      <Link
        to="/chapters"
        className="text-sm text-coffee-500 hover:text-coffee-700 mb-6 inline-block"
      >
        &larr; All Chapters
      </Link>

      {/* Intro */}
      <div className="mb-12 flex items-start gap-6">
        <img
          src="/logos/vfc-jogja-logo.jpg"
          alt="VFC Jogja"
          className="w-20 h-20 rounded-xl shrink-0 hidden sm:block"
        />
        <div>
          <h1 className="text-3xl font-bold text-coffee-800 mb-4">
            VFC Jogja
          </h1>
          <p className="text-coffee-600 max-w-2xl text-lg">
            Jogja is where Vibe Coding From Cafe started. What began as a WhatsApp group
            of vibe coders sharing cafe recommendations has grown into a
            vibrant community exploring the best cafes for AI-assisted coding in
            Yogyakarta.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="bg-white rounded-xl border border-coffee-100 p-5 text-center">
          <p className="text-3xl font-bold text-coffee-800">{jogjaCafes.length}</p>
          <p className="text-sm text-coffee-400">Cafes reviewed</p>
        </div>
        <div className="bg-white rounded-xl border border-coffee-100 p-5 text-center">
          <p className="text-3xl font-bold text-coffee-800">1</p>
          <p className="text-sm text-coffee-400">Active chapter</p>
        </div>
        <div className="bg-white rounded-xl border border-coffee-100 p-5 text-center">
          <p className="text-3xl font-bold text-coffee-800">Growing</p>
          <p className="text-sm text-coffee-400">Community</p>
        </div>
      </div>

      {/* Top Cafes */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-coffee-800">
            Top Cafes in Jogja
          </h2>
          <Link
            to="/cafes"
            className="text-sm font-medium text-coffee-500 hover:text-coffee-700"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topCafes.map((cafe) => (
            <CafeCard key={cafe.slug} cafe={cafe} />
          ))}
        </div>
      </div>

      {/* Join CTA */}
      <div className="bg-coffee-800 text-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Join VFC Jogja</h2>
        <p className="text-warm-200 mb-6 max-w-md mx-auto">
          Connect with vibe coders in Jogja. Share cafe recommendations,
          join vibe coding sessions, and be part of the community.
        </p>
        <Link
          to="/join"
          className="inline-block bg-warm-400 hover:bg-warm-500 text-coffee-900 font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Join on WhatsApp
        </Link>
      </div>
    </div>
    </div>
  );
}
