import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Events — Vibe From Cafe" },
  {
    name: "description",
    content: "Community events by Vibe From Cafe, starting with Vibe Coding sessions and meetups.",
  },
];

export default function Events() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="rounded-2xl border border-vfc-border bg-vfc-surface p-12 shadow-[0_0_24px_rgba%28245%2C196%2C0%2C0.1%29]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-vfc-yellow/40 bg-vfc-yellow/10">
          <svg className="h-8 w-8 text-vfc-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-vfc-white">Events Coming Soon</h1>
        <p className="mx-auto mb-8 max-w-md text-vfc-muted">
          We're planning vibe coding sessions, community meetups, and more.
          Follow us on social media to stay updated!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://x.com/vibefromcafe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-vfc-yellow px-6 py-2.5 font-medium text-vfc-black transition-colors hover:bg-yellow-300"
          >
            Follow on X
          </a>
          <a
            href="https://instagram.com/vibefromcafe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg border border-vfc-border bg-vfc-black px-6 py-2.5 font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow"
          >
            Follow on Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
