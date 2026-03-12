import { Link } from "react-router";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "About — Vibe From Cafe" },
  {
    name: "description",
    content:
      "Learn how Vibe From Cafe evolved from cafe recommendations into a support system for tech workers navigating the AI shift.",
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
            Vibe From Cafe bermula dari kebiasaan sederhana: berbagi rekomendasi
            cafe produktif di Jogja biar kerja makin fokus.
          </p>
          <p className="mb-4 text-vfc-muted">
            Dari ngobrol bareng di meja cafe, topiknya makin sering ke AI.
            Banyak pekerja tech antusias tapi juga bingung harus mulai dari mana,
            atau takut ketinggalan sama pergeseran yang cepat banget.
          </p>
          <p className="text-vfc-muted">
            Dari situ VFC berkembang: bukan cuma direktori cafe, tapi sistem
            pendukung buat orang-orang tech supaya bisa merangkul AI, belajar
            bareng, dan tumbuh bareng. Cafe tetap rumah kita buat ketemu,
            ngobrol, dan eksekusi.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-vfc-border bg-vfc-surface p-6">
          <h2 className="mb-4 text-xl font-semibold text-vfc-yellow">Community Focus</h2>
          <ul className="mb-4 space-y-3 text-vfc-muted">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>AI adoption &amp; hands-on learning</strong> — bukan teori doang, tapi praktik langsung.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>Builder&apos;s disposition</strong> — side projects, experimentation, dan love of making things.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>Career growth in the AI era</strong> — bantu level up role, portfolio, dan confidence.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 font-bold text-vfc-yellow">&#10003;</span>
              <span><strong>Organic talent networking</strong> — koneksi terjadi natural lewat collaboration dan trust.</span>
            </li>
          </ul>
          <p className="text-vfc-muted">
            Chapter model, events, referral system, dan cafe directory tetap jadi
            sarana utama biar support system ini kerasa nyata di kehidupan harian.
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
        <Link
          to="/join"
          className="inline-block rounded-lg bg-vfc-yellow px-8 py-3 font-semibold text-vfc-black transition-colors hover:bg-yellow-300"
        >
          Join the Community
        </Link>
      </div>
    </div>
  );
}
