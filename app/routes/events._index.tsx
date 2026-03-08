import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Events — Vibe Coding From Cafe" },
  {
    name: "description",
    content: "Vibe coding sessions, meetups, and community events by Vibe Coding From Cafe.",
  },
];

export default function Events() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl border border-coffee-100 shadow-sm p-12">
        <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-coffee-800 mb-4">Events Coming Soon</h1>
        <p className="text-coffee-500 mb-8 max-w-md mx-auto">
          We're planning vibe coding sessions, community meetups, and more.
          Follow us on social media to stay updated!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://x.com/vibefromcafe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-coffee-800 hover:bg-coffee-900 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Follow on X
          </a>
          <a
            href="https://instagram.com/vibefromcafe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-coffee-300 hover:border-coffee-500 text-coffee-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Follow on Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
