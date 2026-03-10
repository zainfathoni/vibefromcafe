import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, type MetaFunction } from "react-router";
import type { EventForm } from "../data/event-form";
import type { Event } from "../data/types";

export const meta: MetaFunction = () => [
  { title: "Edit Event — Admin" },
  {
    name: "description",
    content: "Edit or remove a Vibe From Cafe community event.",
  },
];

interface EventResponse {
  event?: Event;
  error?: string;
}

function toForm(event: Event): EventForm {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    cafeId: event.cafeId ?? "",
    imageUrl: event.imageUrl ?? "",
    mapUrl: event.mapUrl ?? "",
    tags: event.tags.join(", "),
  };
}

export default function AdminEventsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<EventForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    if (!id) {
      setError("Event id is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/events/${id}`);
      const data = (await response.json()) as EventResponse;

      if (!response.ok || !data.event) {
        throw new Error(data.error ?? "Failed to load event");
      }

      setForm(toForm(data.event));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  function updateField<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || !id) {
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      location: form.location,
      cafeId: form.cafeId,
      imageUrl: form.imageUrl,
      mapUrl: form.mapUrl,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as EventResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update event");
      }

      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || deleting) {
      return;
    }

    const confirmed = window.confirm("Delete this event? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete event");
      }

      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-vfc-white">Edit Event</h1>
          <p className="mt-2 text-sm text-vfc-muted">Update schedule details, tags, and venue information.</p>
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

      {loading || !form ? (
        <div className="rounded-2xl border border-vfc-border bg-vfc-surface px-5 py-10 text-center text-vfc-muted">
          Loading event…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-vfc-border bg-vfc-surface p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-vfc-white">Title</span>
            <input
              type="text"
              required
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
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
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-vfc-white">Image URL (optional)</span>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-vfc-white">Map URL (optional)</span>
            <input
              type="url"
              value={form.mapUrl}
              onChange={(event) => updateField("mapUrl", event.target.value)}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
              placeholder="https://maps.app.goo.gl/..."
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-vfc-white">Tags</span>
            <input
              type="text"
              required
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              className="w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex rounded-lg bg-vfc-yellow px-6 py-2.5 font-semibold text-vfc-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-vfc-border disabled:text-vfc-muted"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="inline-flex rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-2.5 text-sm font-medium text-red-200 transition-colors hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deleting ? "Deleting…" : "Delete Event"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
