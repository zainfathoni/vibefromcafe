import { Link } from "react-router";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "About — Vibe From Cafe" },
  {
    name: "description",
    content:
      "Learn about Vibe From Cafe — a community for remote workers in Indonesia.",
  },
];

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-coffee-800 mb-8">About Vibe From Cafe</h1>

      <div className="prose max-w-none">
        <div className="bg-white rounded-xl border border-coffee-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-coffee-800 mb-4">Our Story</h2>
          <p className="text-coffee-600 mb-4">
            Vibe From Cafe started as a WhatsApp group for remote workers in Jogja who
            wanted to share their favorite cafe spots. We'd swap notes on WiFi speeds,
            power outlet availability, and which cafes had the best vibes for getting
            work done.
          </p>
          <p className="text-coffee-600 mb-4">
            What started as casual recommendations quickly grew into something bigger.
            We realized that remote workers across Indonesia needed a reliable way to
            find work-friendly cafes — not just any cafe, but ones where you can actually
            be productive.
          </p>
          <p className="text-coffee-600">
            So we built this. Every cafe on Vibe From Cafe has been visited and reviewed
            by community members. The WiFi speeds are real (we run speed tests). The
            amenity info is verified. No paid placements, no ads — just honest
            recommendations from people who work from cafes every day.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-coffee-800 mb-4">Our Vision</h2>
          <p className="text-coffee-600 mb-4">
            We envision a nationwide community of remote workers who support each other
            and contribute to a shared knowledge base of the best work-friendly cafes
            in Indonesia.
          </p>
          <p className="text-coffee-600">
            Starting from Jogja, we're expanding to Jakarta, Bandung, and beyond. Each
            chapter is community-driven — locals who know their city's cafe scene best.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-coffee-800 mb-4">What We Review</h2>
          <ul className="space-y-3 text-coffee-600">
            <li className="flex items-start gap-3">
              <span className="text-leaf-500 font-bold mt-0.5">&#10003;</span>
              <span><strong>WiFi Speed</strong> — Real speed test results, not just "WiFi available"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-leaf-500 font-bold mt-0.5">&#10003;</span>
              <span><strong>Power Outlets</strong> — Because a dead laptop means no work</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-leaf-500 font-bold mt-0.5">&#10003;</span>
              <span><strong>Atmosphere</strong> — Quiet vibes, background music, crowd levels</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-leaf-500 font-bold mt-0.5">&#10003;</span>
              <span><strong>Amenities</strong> — AC, musholla, private rooms, kids area</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-leaf-500 font-bold mt-0.5">&#10003;</span>
              <span><strong>Prices</strong> — So you know before you go</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-coffee-100 p-6">
          <h2 className="text-xl font-semibold text-coffee-800 mb-4">Connect With Us</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://x.com/vibefromcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coffee-600 hover:text-coffee-800 font-medium"
            >
              X (@vibefromcafe)
            </a>
            <a
              href="https://instagram.com/vibefromcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coffee-600 hover:text-coffee-800 font-medium"
            >
              Instagram (@vibefromcafe)
            </a>
            <a
              href="https://github.com/vibefromcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coffee-600 hover:text-coffee-800 font-medium"
            >
              GitHub (@vibefromcafe)
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/join"
          className="inline-block bg-coffee-700 hover:bg-coffee-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Join the Community
        </Link>
      </div>
    </div>
  );
}
