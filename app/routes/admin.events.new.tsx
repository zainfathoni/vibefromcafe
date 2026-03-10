import { useState, type FormEvent } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";
import type { EventForm } from "../data/event-form";

export const meta: MetaFunction = () => [
  { title: "Create Event — Admin" },
  {
    name: "description",
    content: "Create a new community event for Vibe From Cafe.",
  },
];

const initialForm: EventForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  cafeId: "",
  imageUrl: "",
  tags: "",
};

export default function AdminEventsNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState<EventForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      location: form.location,
      cafeId: form.cafeId,
      imageUrl: form.imageUrl,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create event");
      }

      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-vfc-white">Create New Event</h1>
          <p className="mt-2 text-sm text-vfc-muted">Publish a new event that will appear on the public events page.</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center rounded-lg border border-vfc-border bg-vfc-surface px-4 py-2 text-sm font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow"
        >
          Back to Admin
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-vfc-border bg-vfc-surface p-6">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-vfc-white">Title</span>
          <input
            type="text"
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
            placeholder="Vibe Coding Night"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-vfc-white">Description</span>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
            placeholder="What will happen during this event?"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-vfc-white">Date</span>
            <input
              type="date"
              required
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-vfc-white">Time</span>
            <input
              type="time"
              required
              value={form.time}
              onChange={(event) => updateField("time", event.target.value)}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-vfc-white">Location</span>
          <input
            type="text"
            required
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
            placeholder="Cafe name, city"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-vfc-white">Cafe ID (optional)</span>
            <input
              type="text"
              value={form.cafeId}
              onChange={(event) => updateField("cafeId", event.target.value)}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
              placeholder="cafe-slug"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-vfc-white">Image URL (optional)</span>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
              placeholder="https://..."
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-vfc-white">Tags</span>
          <input
            type="text"
            required
            value={form.tags}
            onChange={(event) => updateField("tags", event.target.value)}
            className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
            placeholder="vibe coding, networking, demo"
          />
          <p className="mt-2 text-xs text-vfc-muted">Use comma-separated tags.</p>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex rounded-lg bg-vfc-yellow px-6 py-2.5 font-semibold text-vfc-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-vfc-border disabled:text-vfc-muted"
        >
          {submitting ? "Creating…" : "Create Event"}
        </button>
      </form>
    </div>
  );
}
