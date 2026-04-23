import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import type { Event } from "../data/types";

export const meta: MetaFunction = () => [
  { title: "Events — VFC Admin" },
];

interface EventsResponse {
  events?: Event[];
  error?: string;
}

function formatSchedule(event: Event) {
  const d = new Date(`${event.date}T00:00:00`);
  const date = Number.isNaN(d.getTime())
    ? event.date
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return `${date} • ${event.time}`;
}

function formatCreatedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events");
      const data = (await res.json()) as EventsResponse;
      if (!res.ok) throw new Error(data.error ? `Failed to load events: ${data.error}` : "Failed to load events");
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vfc-white">Events</h1>
          <p className="mt-1 text-sm text-vfc-muted">
            Publish new events and manage existing schedules on the public events page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex cursor-pointer items-center rounded-lg border border-vfc-border bg-vfc-surface px-4 py-2 text-sm font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            to="/admin/events/new"
            className="inline-flex items-center rounded-lg bg-vfc-yellow px-4 py-2 text-sm font-semibold text-vfc-black transition-colors hover:bg-yellow-300"
          >
            + New Event
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-vfc-border bg-vfc-surface">
        <div className="flex items-center justify-between border-b border-vfc-border px-5 py-3 text-sm text-vfc-muted">
          <span>Total events</span>
          <span className="font-semibold text-vfc-white">{events.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-vfc-black/50 text-xs uppercase tracking-wide text-vfc-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Schedule</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Tags</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-vfc-muted" colSpan={6}>Loading…</td></tr>
              ) : events.length === 0 ? (
                <tr>
                  <td className="px-5 py-8" colSpan={6}>
                    <p className="text-vfc-muted">No events found.</p>
                    <Link to="/admin/events/new" className="mt-2 inline-flex text-sm text-vfc-yellow hover:underline">
                      Create the first event →
                    </Link>
                  </td>
                </tr>
              ) : events.map((event) => (
                <tr key={event.id} className="border-t border-vfc-border/60 align-top transition-colors hover:bg-vfc-black/20">
                  <td className="px-5 py-3.5 font-medium text-vfc-white">{event.title}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-vfc-white/90">{formatSchedule(event)}</td>
                  <td className="px-5 py-3.5 text-vfc-white/90">{event.location}</td>
                  <td className="px-5 py-3.5 text-vfc-white/90">{event.tags.length > 0 ? event.tags.join(", ") : "-"}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-vfc-white/70">{formatCreatedAt(event.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/admin/events/${event.id}/edit`}
                      className="inline-flex items-center rounded-md border border-vfc-border px-3 py-1.5 text-xs font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
