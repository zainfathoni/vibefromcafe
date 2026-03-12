import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";
import CafeCard from "../components/CafeCard";
import type { Cafe } from "../data/types";

export const meta: MetaFunction = () => [
  { title: "VFC Jogja — Chapter Yogyakarta" },
  {
    name: "description",
    content:
      "VFC Jogja is the first active chapter under Vibe From Cafe, where tech workers learn AI together from real cafe workspaces.",
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
          src="/logos/vfc-jogja-banner-dark.jpg"
          alt="Vibe Coding From Cafe — Chapter Yogyakarta"
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <Link
          to="/chapters"
          className="mb-6 inline-block text-sm text-vfc-muted hover:text-vfc-yellow"
        >
          &larr; All Chapters
        </Link>

        {/* Intro */}
        <div className="mb-12 flex items-start gap-6">
          <img
            src="/logos/vfc-jogja-logo-dark.jpg"
            alt="VFC Jogja"
            className="w-20 h-20 rounded-xl shrink-0 hidden sm:block"
          />
          <div>
            <h1 className="mb-4 text-3xl font-bold text-vfc-white">
              Vibe Coding Jogja
            </h1>
            <p className="max-w-2xl text-lg text-vfc-muted">
              This is the first active chapter under Vibe From Cafe. What began
              as a local coding circle has grown into a support system for tech
              workers exploring AI hands-on from real cafe workspaces in Jogja.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="rounded-xl border border-vfc-border bg-vfc-surface p-5 text-center">
            <p className="text-3xl font-bold text-vfc-yellow">{jogjaCafes.length}</p>
            <p className="text-sm text-vfc-muted">Cafes reviewed</p>
          </div>
          <div className="rounded-xl border border-vfc-border bg-vfc-surface p-5 text-center">
            <p className="text-3xl font-bold text-vfc-yellow">1</p>
            <p className="text-sm text-vfc-muted">Active theme chapter</p>
          </div>
          <div className="rounded-xl border border-vfc-border bg-vfc-surface p-5 text-center">
            <p className="text-3xl font-bold text-vfc-yellow">Growing</p>
            <p className="text-sm text-vfc-muted">Community</p>
          </div>
        </div>

        {/* Top Cafes */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-vfc-white">
              Top Cafes in Jogja
            </h2>
            <Link
              to="/cafes"
              className="text-sm font-medium text-vfc-muted hover:text-vfc-yellow"
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
        <div className="rounded-2xl border border-vfc-border bg-vfc-surface p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Join the Jogja Support Circle</h2>
          <p className="mb-6 max-w-md mx-auto text-vfc-muted">
            Connect with builders in Jogja, share cafe recommendations, and
            join invite-only sessions focused on AI adoption and career growth.
          </p>
          <Link
            to="/join"
            className="inline-block rounded-lg bg-vfc-yellow px-8 py-3 font-semibold text-vfc-black transition-colors hover:bg-yellow-300"
          >
            Join the Community
          </Link>
        </div>
      </div>
    </div>
  );
}
