import { useState, type FormEvent } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Join — Vibe From Cafe" },
  {
    name: "description",
    content:
      "Join Vibe From Cafe and express interest in Vibe Coding, the first active community theme.",
  },
];

type InterestForm = {
  name: string;
  city: string;
  role: string;
};

const initialForm: InterestForm = {
  name: "",
  city: "",
  role: "",
};

export default function Join() {
  const [form, setForm] = useState<InterestForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof InterestForm>(key: K, value: InterestForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-vfc-white">Join Vibe From Cafe</h1>
        <p className="mx-auto max-w-xl text-lg text-vfc-muted">
          Vibe Coding is our first active theme. Fill the interest form and we'll reach out when new chapter activities open.
        </p>
      </div>

      <div className="mb-10 rounded-2xl border border-vfc-border bg-vfc-surface p-6">
        {submitted ? (
          <div className="text-center">
            <h2 className="mb-3 text-2xl font-semibold text-vfc-yellow">Thanks for your interest!</h2>
            <p className="text-vfc-muted">
              We received your details and will contact you for future Vibe From Cafe updates.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-vfc-white">Name</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
                placeholder="Your name"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-vfc-white">City</span>
              <input
                type="text"
                required
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
                placeholder="Where are you based?"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-vfc-white">What do you do?</span>
              <textarea
                required
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
                placeholder="Builder, designer, marketer, student, etc."
              />
            </label>

            <p className="text-sm text-vfc-muted">
              WhatsApp community access is invite-only. This form helps us prioritize onboarding.
            </p>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex rounded-lg bg-vfc-yellow px-6 py-2.5 font-semibold text-vfc-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-vfc-border disabled:text-vfc-muted"
            >
              {loading ? "Submitting…" : "Express Interest"}
            </button>
          </form>
        )}
      </div>

      <div className="space-y-4">
        <a
          href="https://x.com/vibefromcafe"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded-xl border border-vfc-border bg-vfc-surface p-5 transition-colors hover:border-vfc-yellow"
        >
          <div>
            <h2 className="text-lg font-semibold text-vfc-white group-hover:text-vfc-yellow">X (Twitter)</h2>
            <p className="text-sm text-vfc-muted">Follow @vibefromcafe for chapter updates.</p>
          </div>
          <span className="text-vfc-muted group-hover:text-vfc-yellow">&rarr;</span>
        </a>

        <a
          href="https://instagram.com/vibefromcafe"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded-xl border border-vfc-border bg-vfc-surface p-5 transition-colors hover:border-vfc-yellow"
        >
          <div>
            <h2 className="text-lg font-semibold text-vfc-white group-hover:text-vfc-yellow">Instagram</h2>
            <p className="text-sm text-vfc-muted">Follow @vibefromcafe for cafe stories and snapshots.</p>
          </div>
          <span className="text-vfc-muted group-hover:text-vfc-yellow">&rarr;</span>
        </a>

        <a
          href="https://github.com/zainfathoni/vibefromcafe"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded-xl border border-vfc-border bg-vfc-surface p-5 transition-colors hover:border-vfc-yellow"
        >
          <div>
            <h2 className="text-lg font-semibold text-vfc-white group-hover:text-vfc-yellow">GitHub</h2>
            <p className="text-sm text-vfc-muted">Contribute to the open source project.</p>
          </div>
          <span className="text-vfc-muted group-hover:text-vfc-yellow">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
