import { Link } from "react-router";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "About — Vibe From Cafe" },
  {
    name: "description",
    content:
      "Learn about Vibe From Cafe, a community built from cafes across Indonesia, with Vibe Coding as the first active theme.",
  },
];

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-vfc-white">About Vibe From Cafe</h1>

      <div>
        <div className="mb-8 rounded-xl border border-vfc-border bg-vfc-surface p-6">
          <h2 className="mb-4 text-xl font-semibold text-vfc-yellow">Our Story</h2>
          <p className="mb-4 text-vfc-muted">
            Vibe From Cafe started as a community of people sharing productive cafe spots in Jogja.
            The first theme we organized around was Vibe Coding: builders using AI and modern tools
            from real-world cafe workspaces.
          </p>
          <p className="mb-4 text-vfc-muted">
            What began as recommendations quickly became a structured community effort.
            We realized people needed reliable, verified information on cafes where real work can happen,
            not just aesthetic spots.
          </p>
          <p className="text-vfc-muted">
            Every cafe on Vibe From Cafe is reviewed by community members. WiFi speeds are measured,
            amenity info is verified, and recommendations stay transparent.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-vfc-border bg-vfc-surface p-6">
          <h2 className="mb-4 text-xl font-semibold text-vfc-yellow">Community Themes</h2>
          <p className="mb-4 text-vfc-muted">
            Vibe Coding is the first active theme in Vibe From Cafe.
            Over time, we plan to expand into more themes like Marketing, Learning,
            and other creative/professional communities that thrive in cafe environments.
          </p>
          <p className="text-vfc-muted">
            Our chapter model stays community-driven: locals curate local spots,
            and each theme can adapt to the way people actually work in each city.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-vfc-border bg-vfc-surface p-6">
          <h2 className="mb-4 text-xl font-semibold text-vfc-yellow">What We Review</h2>
          <ul className="space-y-3 text-vfc-muted">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>WiFi Speed</strong> — Real speed test results, not just "WiFi available"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>Power Outlets</strong> — Because a dead laptop means no work</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>Atmosphere</strong> — Quiet vibes, background music, crowd levels</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>Amenities</strong> — AC, musholla, private rooms, kids area</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>Prices</strong> — So you know before you go</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-vfc-border bg-vfc-surface p-6">
          <h2 className="mb-4 text-xl font-semibold text-vfc-yellow">Connect With Us</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://x.com/vibefromcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-vfc-muted hover:text-vfc-yellow"
            >
              X (@vibefromcafe)
            </a>
            <a
              href="https://instagram.com/vibefromcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-vfc-muted hover:text-vfc-yellow"
            >
              Instagram (@vibefromcafe)
            </a>
            <a
              href="https://github.com/vibefromcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-vfc-muted hover:text-vfc-yellow"
            >
              GitHub (@vibefromcafe)
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <span
          className="inline-block cursor-not-allowed rounded-lg bg-vfc-border px-8 py-3 font-semibold text-vfc-muted"
        >
          Coming Soon
        </span>
      </div>
    </div>
  );
}
