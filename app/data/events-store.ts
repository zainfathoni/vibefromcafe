import seedEvents from "./events.json";
import type { Event } from "./types";

interface Env {
  DB: D1Database;
}

type EventRow = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  cafe_id: string | null;
  image_url: string | null;
  map_url: string | null;
  status: string;
  tags: string;
  created_at: string;
  is_deleted: number;
};

function rowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    time: row.time,
    location: row.location,
    cafeId: row.cafe_id ?? undefined,
    imageUrl: row.image_url ?? undefined,
    mapUrl: row.map_url ?? undefined,
    status: row.status === "draft" ? "draft" : "published",
    tags: JSON.parse(row.tags || "[]") as string[],
    createdAt: row.created_at,
  };
}

function toDateValue(event: Event) {
  return Date.parse(`${event.date}T${event.time || "00:00"}:00`);
}

function sortEvents(events: Event[]) {
  return [...events].sort((a, b) => {
    const dateA = toDateValue(a);
    const dateB = toDateValue(b);
    if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) return dateA - dateB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function normalizeStatus(event: Event): Event {
  return { ...event, status: event.status === "draft" ? "draft" : "published" };
}

export async function getAllEvents(env: Env): Promise<Event[]> {
  const { results } = await env.DB.prepare("SELECT * FROM events").all<EventRow>();

  const deletedIds = new Set<string>();
  const storedById = new Map<string, Event>();

  for (const row of results) {
    if (row.is_deleted === 1) {
      deletedIds.add(row.id);
    } else {
      storedById.set(row.id, rowToEvent(row));
    }
  }

  // Seed events as base; D1 rows override by id; deleted ids are excluded
  const mergedById = new Map<string, Event>();
  for (const event of (seedEvents as Event[]).map(normalizeStatus)) {
    if (!deletedIds.has(event.id)) {
      mergedById.set(event.id, event);
    }
  }
  for (const [id, event] of storedById) {
    mergedById.set(id, event);
  }

  return sortEvents(Array.from(mergedById.values()));
}

export async function getEventById(env: Env, id: string): Promise<Event | null> {
  const normalized = id.trim();
  if (!normalized) return null;

  const row = await env.DB.prepare("SELECT * FROM events WHERE id = ?")
    .bind(normalized)
    .first<EventRow>();

  if (row) {
    return row.is_deleted === 1 ? null : rowToEvent(row);
  }

  // Not in D1 — check seed data
  const seed = (seedEvents as Event[]).find((e) => e.id === normalized);
  return seed ? normalizeStatus(seed) : null;
}

export async function saveEvent(env: Env, event: Event): Promise<void> {
  const e = normalizeStatus(event);
  await env.DB.prepare(`
    INSERT INTO events (id, title, description, date, time, location, cafe_id, image_url, map_url, status, tags, created_at, is_deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(id) DO UPDATE SET
      title       = excluded.title,
      description = excluded.description,
      date        = excluded.date,
      time        = excluded.time,
      location    = excluded.location,
      cafe_id     = excluded.cafe_id,
      image_url   = excluded.image_url,
      map_url     = excluded.map_url,
      status      = excluded.status,
      tags        = excluded.tags,
      is_deleted  = 0
  `).bind(
    e.id, e.title, e.description, e.date, e.time, e.location,
    e.cafeId ?? null, e.imageUrl ?? null, e.mapUrl ?? null,
    e.status, JSON.stringify(e.tags), e.createdAt,
  ).run();
}

export async function removeEvent(env: Env, id: string): Promise<boolean> {
  const normalized = id.trim();
  if (!normalized) return false;

  const existing = await getEventById(env, normalized);
  if (!existing) return false;

  // Upsert with is_deleted=1 — works for both seed and stored events
  await env.DB.prepare(`
    INSERT INTO events (id, title, description, date, time, location, status, tags, created_at, is_deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET is_deleted = 1
  `).bind(
    normalized, existing.title, existing.description,
    existing.date, existing.time, existing.location,
    existing.status, JSON.stringify(existing.tags), existing.createdAt,
  ).run();

  return true;
}
