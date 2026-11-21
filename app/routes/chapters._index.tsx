import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";

export const meta: MetaFunction = () => [
  { title: "Chapters — Vibe From Cafe" },
  {
    name: "description",
    content:
      "Explore Vibe From Cafe communities in Jogja, Solo, Bandung, Surabaya, Malang, and Kuala Lumpur, plus meetups in Jakarta.",
  },
];

const communities = [
  { name: "Solo", description: "Connect with the VFC community in Solo (Surakarta)." },
  { name: "Bandung", description: "Join local conversations and cafe meetups with VFC Bandung." },
  { name: "Surabaya–Malang", description: "One shared VFC group connects members in Surabaya and Malang." },
  { name: "Kuala Lumpur", description: "VFC connections extend beyond Indonesia with a local group in Kuala Lumpur, Malaysia." },
];

export default function Chapters() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-vfc-white mb-2">Chapters</h1>
      <p className="text-vfc-muted mb-10">
        Find VFC in Jogja, Solo, Bandung, Surabaya, Malang, and Kuala Lumpur,
        with meetup presence in Jakarta too. Local groups bring people together
        to work, learn, and share from cafes.
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
            The first VFC chapter. A thriving support circle for builders and
            tech workers in the cultural heart of Java.
          </p>
          <span className="text-sm font-medium text-vfc-yellow">
            Explore Jogja &rarr;
          </span>
        </Link>

        {communities.map((community) => (
          <div key={community.name} className="flex flex-col rounded-xl border border-vfc-border bg-vfc-surface p-6">
            <p className="mb-3 text-xs font-medium text-vfc-yellow">Local group</p>
            <h2 className="mb-2 text-2xl font-bold text-vfc-white">{community.name}</h2>
            <p className="mb-4 text-sm text-vfc-muted">{community.description}</p>
            <Link to="/join" className="mt-auto text-sm font-medium text-vfc-yellow hover:underline">
              Join the community &rarr;
            </Link>
          </div>
        ))}

        <div className="flex flex-col rounded-xl border border-vfc-border bg-vfc-surface p-6">
          <p className="mb-3 text-xs font-medium text-vfc-yellow">Meetup presence</p>
          <h2 className="mb-2 text-2xl font-bold text-vfc-white">Jakarta</h2>
          <p className="mb-4 text-sm text-vfc-muted">
            VFC members also meet in Jakarta, including a pre-IDSW coffee meetup
            on 20 November 2026. This is meetup presence, not a separately
            confirmed local chapter.
          </p>
          <Link to="/join" className="mt-auto text-sm font-medium text-vfc-yellow hover:underline">
            Join the community &rarr;
          </Link>
        </div>
      </div>
      <p className="mt-8 text-sm text-vfc-muted">
        Presence checked on 22 November 2026. Local groups do not imply a regular
        event schedule or a published cafe directory; Jogja currently has the
        dedicated chapter page and cafe reviews.
      </p>
    </div>
  );
}
