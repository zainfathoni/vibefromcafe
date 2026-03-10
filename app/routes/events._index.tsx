import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";
import type { Cafe, Event } from "../data/types";

const cafesById = new Map((cafes as Cafe[]).map((c) => [c.slug, c]));

export const meta: MetaFunction = () => [
  { title: "Events — Vibe From Cafe" },
  {
    name: "description",
    content: "Community events by Vibe From Cafe, starting with Vibe Coding sessions and meetups.",
  },
];

interface EventsResponse {
  events?: Event[];
  error?: string;
}

function formatEventDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatEventTime(time: string) {
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) {
    return time;
  }

  return `${hours}:${minutes} WIB`;
}

function resolveEventImage(event: Event): string | undefined {
  if (event.imageUrl) return event.imageUrl;
  if (event.cafeId) return cafesById.get(event.cafeId)?.imageUrl;
  return undefined;
}

function resolveEventMapUrl(event: Event): string | undefined {
  if (event.mapUrl) return event.mapUrl;
  if (event.cafeId) return cafesById.get(event.cafeId)?.mapUrl;
  return undefined;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/events");
      const data = (await response.json()) as EventsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load events");
      }

      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-vfc-white">Community Events</h1>
          <p className="mt-2 max-w-2xl text-vfc-muted">
            Join VFC coding sessions, coffee meetups, and open demos across our chapter spaces.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadEvents()}
          disabled={loading}
          className="inline-flex cursor-pointer items-center rounded-lg border border-vfc-border bg-vfc-surface px-4 py-2 text-sm font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-vfc-border bg-vfc-surface px-5 py-10 text-center text-vfc-muted">
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-vfc-border bg-vfc-surface px-5 py-10 text-center">
          <h2 className="text-xl font-semibold text-vfc-white">No events yet</h2>
          <p className="mt-2 text-vfc-muted">New events will appear here as soon as they are published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const imageUrl = resolveEventImage(event);
            const mapUrl = resolveEventMapUrl(event);
            return (
            <article
              key={event.id}
              className="overflow-hidden rounded-2xl border border-vfc-border bg-vfc-surface transition-colors hover:border-vfc-yellow/80"
            >
              {imageUrl ? (
                <img src={imageUrl} alt={event.title} className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-44 w-full items-center justify-center bg-vfc-black">
                  <svg className="h-10 w-10 text-vfc-yellow/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-vfc-yellow">{formatEventDate(event.date)} • {formatEventTime(event.time)}</p>
                  <h2 className="mt-2 text-xl font-semibold text-vfc-white">{event.title}</h2>
                </div>

                <p className="text-sm leading-relaxed text-vfc-muted">{event.description}</p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-vfc-white/90">
                  {event.cafeId ? (
                    <Link to={`/cafes/${event.cafeId}`} className="underline decoration-vfc-yellow/40 underline-offset-2 transition-colors hover:text-vfc-yellow">
                      {event.location}
                    </Link>
                  ) : (
                    <span>{event.location}</span>
                  )}
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-vfc-muted transition-colors hover:text-vfc-yellow">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Map
                    </a>
                  )}
                </div>

                {event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={`${event.id}-${tag}`}
                        className="rounded-full border border-vfc-border bg-vfc-black px-2.5 py-1 text-xs text-vfc-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
