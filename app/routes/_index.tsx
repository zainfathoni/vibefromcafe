import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";
import CafeCard from "../components/CafeCard";
import type { Cafe } from "../data/types";

export const meta: MetaFunction = () => [
  { title: "Vibe From Cafe — Remote Work Community in Indonesia" },
  {
    name: "description",
    content:
      "Where remote workers vibe, code, and connect — from cafes across Indonesia.",
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
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-coffee-800 via-coffee-700 to-coffee-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Where remote workers vibe, code, and connect — from cafes across
            Indonesia.
          </h1>
          <p className="text-lg text-warm-200 mb-8 max-w-2xl mx-auto">
            Find the best cafes for working remotely. Real WiFi speeds, power
            outlets, and vibes — reviewed by the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cafes"
              className="inline-block bg-warm-400 hover:bg-warm-500 text-coffee-900 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Browse Cafes
            </Link>
            <Link
              to="/join"
              className="inline-block border-2 border-warm-300 hover:bg-warm-300/10 text-warm-100 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cafes */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-coffee-800">
            Top Cafes by WiFi Speed
          </h2>
          <Link
            to="/cafes"
            className="text-sm font-medium text-coffee-500 hover:text-coffee-700"
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
      <section className="bg-coffee-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-coffee-800 mb-4">
            Upcoming Events
          </h2>
          <p className="text-coffee-500 mb-6">
            Community meetups, co-working sessions, and more — coming soon.
          </p>
          <Link
            to="/events"
            className="text-sm font-medium text-coffee-600 hover:text-coffee-800"
          >
            Check events &rarr;
          </Link>
        </div>
      </section>

      {/* Chapters */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-coffee-800 mb-8">
          Our Chapters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/chapters/jogja"
            className="bg-white rounded-xl border border-coffee-100 shadow-sm hover:shadow-md transition-all p-6 group"
          >
            <h3 className="text-xl font-semibold text-coffee-800 group-hover:text-coffee-600 mb-2">
              Jogja
            </h3>
            <p className="text-coffee-400 text-sm mb-3">
              {cafes.length}+ cafes reviewed
            </p>
            <p className="text-coffee-500 text-sm">
              The first VFC chapter. A thriving community of remote workers in
              the heart of Java.
            </p>
          </Link>

          <div className="bg-coffee-50 rounded-xl border border-dashed border-coffee-200 p-6 opacity-60">
            <h3 className="text-xl font-semibold text-coffee-600 mb-2">
              Jakarta
            </h3>
            <p className="text-coffee-400 text-sm">Coming soon</p>
          </div>

          <div className="bg-coffee-50 rounded-xl border border-dashed border-coffee-200 p-6 opacity-60">
            <h3 className="text-xl font-semibold text-coffee-600 mb-2">
              Bandung
            </h3>
            <p className="text-coffee-400 text-sm">Coming soon</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-coffee-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Join the Vibe From Cafe community
          </h2>
          <p className="text-warm-200 mb-8">
            Connect with fellow remote workers, share your favorite cafe spots,
            and find your next workspace.
          </p>
          <Link
            to="/join"
            className="inline-block bg-warm-400 hover:bg-warm-500 text-coffee-900 font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Join on WhatsApp
          </Link>
        </div>
      </section>
    </div>
  );
}
