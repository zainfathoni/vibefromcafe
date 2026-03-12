import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";
import CafeCard from "../components/CafeCard";
import type { Cafe } from "../data/types";

export const meta: MetaFunction = () => [
  { title: "Vibe From Cafe — Navigate the AI Shift Together" },
  {
    name: "description",
    content:
      "Vibe From Cafe is a support system for tech workers navigating the AI shift — belajar bareng, build side projects, and level up careers sambil ngopi.",
  },
];

function getTopCafesByWifi(allCafes: Cafe[], count: number): Cafe[] {
  return [...allCafes]
    .filter((c) => c.wifi_speed)
    .sort((a, b) => {
      const speedA = parseFloat((a.wifi_speed ?? "0").split(":")[0]);
      const speedB = parseFloat((b.wifi_speed ?? "0").split(":")[0]);
      return speedB - speedA;
    })
    .slice(0, count);
}

export default function Home() {
  const featuredCafes = getTopCafesByWifi(cafes as Cafe[], 4);

  return (
    <div className="bg-vfc-black">
      {/* Hero */}
      <section className="relative overflow-hidden bg-vfc-black py-24 px-4 text-vfc-white">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-vfc-yellow/15 blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <img src="/logos/vfc-logo.jpg" alt="Vibe From Cafe" className="h-30 w-auto mx-auto mb-8 rounded-xl" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Navigate the <span className="text-vfc-yellow">AI shift</span> &mdash;
            together.
          </h1>
          <p className="text-lg text-vfc-muted mb-8 max-w-2xl mx-auto">
            VFC is a community of tech workers who embrace AI instead of fearing
            it. We learn together, build together, and support each other through
            the biggest shift in our industry &mdash; sambil ngopi di cafe favorit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cafes"
              className="inline-block rounded-lg bg-vfc-yellow px-8 py-3 font-semibold text-vfc-black transition-colors hover:bg-yellow-300"
            >
              Browse Cafes
            </Link>
            <Link
              to="/join"
              className="inline-block rounded-lg border-2 border-vfc-yellow px-8 py-3 font-semibold text-vfc-yellow transition-colors hover:bg-vfc-yellow hover:text-vfc-black"
            >
              Join the Support System
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cafes */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-vfc-white">
            Top Cafes by WiFi Speed
          </h2>
          <Link
            to="/cafes"
            className="text-sm font-medium text-vfc-muted hover:text-vfc-yellow"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCafes.map((cafe) => (
            <CafeCard key={cafe.slug} cafe={cafe} />
          ))}
        </div>
      </section>

      {/* Events Placeholder */}
      <section className="bg-vfc-surface py-16 px-4 border-y border-vfc-border">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-vfc-white mb-4">
            Upcoming Events
          </h2>
          <p className="text-vfc-muted mb-6">
            Hands-on AI adoption sessions, builder meetups, and career growth
            circles &mdash; coming soon.
          </p>
          <Link
            to="/events"
            className="text-sm font-medium text-vfc-yellow hover:text-yellow-300"
          >
            Check events &rarr;
          </Link>
        </div>
      </section>

      {/* Chapters */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-vfc-white mb-8">
          Our Chapters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/chapters/jogja"
            className="group rounded-xl border border-vfc-border bg-vfc-surface p-6 transition-all hover:border-vfc-yellow"
          >
            <h3 className="text-xl font-semibold text-vfc-white group-hover:text-vfc-yellow mb-2">
              Jogja
            </h3>
            <p className="text-vfc-muted text-sm mb-3">
              {cafes.length}+ cafes reviewed
            </p>
            <p className="text-vfc-muted text-sm">
              The first VFC chapter. Tech workers and builders learning AI
              together in the heart of Java.
            </p>
          </Link>

          <div className="rounded-xl border border-dashed border-vfc-border bg-vfc-black p-6 opacity-80">
            <h3 className="text-xl font-semibold text-vfc-white/70 mb-2">
              Jakarta
            </h3>
            <p className="text-vfc-muted text-sm">Coming soon</p>
          </div>

          <div className="rounded-xl border border-dashed border-vfc-border bg-vfc-black p-6 opacity-80">
            <h3 className="text-xl font-semibold text-vfc-white/70 mb-2">
              Bandung
            </h3>
            <p className="text-vfc-muted text-sm">Coming soon</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-vfc-border bg-vfc-surface py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Kamu nggak harus navigate the AI shift sendirian
          </h2>
          <p className="text-vfc-muted mb-8">
            Join VFC support system buat belajar bareng, bangun side projects,
            dan tumbuh di era AI sambil tetap keep the cafe vibes alive.
          </p>
          <Link
            to="/join"
            className="inline-block rounded-lg bg-vfc-yellow px-8 py-3 font-semibold text-vfc-black transition-colors hover:bg-yellow-300"
          >
            Join the Support System
          </Link>
        </div>
      </section>
    </div>
  );
}
