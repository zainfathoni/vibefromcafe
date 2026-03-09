import seedEvents from "./events.json";
import type { Event } from "./types";

interface Env {
  VFC_SUBMISSIONS: KVNamespace;
}

const EVENT_PREFIX = "event:";
const EVENT_DELETED_PREFIX = "event-deleted:";

function toDateValue(event: Event) {
  return Date.parse(`${event.date}T${event.time || "00:00"}:00`);
}

function sortEvents(events: Event[]) {
  return [...events].sort((a, b) => {
    const dateA = toDateValue(a);
    const dateB = toDateValue(b);

    if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
      return dateA - dateB;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

async function listKeysByPrefix(env: Env, prefix: string) {
  const keys: string[] = [];
  let cursor: string | undefined;

  do {
    const listing = await env.VFC_SUBMISSIONS.list({ prefix, cursor, limit: 1000 });
    keys.push(...listing.keys.map((key) => key.name));
    cursor = listing.list_complete ? undefined : listing.cursor;
  } while (cursor);

  return keys;
}

async function listStoredEvents(env: Env) {
  const keys = await listKeysByPrefix(env, EVENT_PREFIX);
  if (keys.length === 0) {
    return [] as Event[];
  }

  const records = await Promise.all(
    keys.map((key) => env.VFC_SUBMISSIONS.get<Event>(key, "json")),
  );

  return records.filter((record): record is Event => Boolean(record));
}

async function getDeletedEventIds(env: Env) {
  const keys = await listKeysByPrefix(env, EVENT_DELETED_PREFIX);

  return new Set(
    keys
      .map((key) => key.slice(EVENT_DELETED_PREFIX.length))
      .filter((id) => id.length > 0),
  );
}

export async function getAllEvents(env: Env) {
  const deletedIds = await getDeletedEventIds(env);
  const seedRecords = (seedEvents as Event[]).filter((event) => !deletedIds.has(event.id));
  const storedRecords = await listStoredEvents(env);

  const mergedById = new Map<string, Event>();
  for (const event of seedRecords) {
    mergedById.set(event.id, event);
  }
  for (const event of storedRecords) {
    if (!deletedIds.has(event.id)) {
      mergedById.set(event.id, event);
    }
  }

  return sortEvents(Array.from(mergedById.values()));
}

export async function getEventById(env: Env, id: string) {
  const normalizedId = id.trim();
  if (!normalizedId) {
    return null;
  }

  const deletedMarker = await env.VFC_SUBMISSIONS.get(
    `${EVENT_DELETED_PREFIX}${normalizedId}`,
    "text",
  );
  if (deletedMarker) {
    return null;
  }

  const storedRecord = await env.VFC_SUBMISSIONS.get<Event>(
    `${EVENT_PREFIX}${normalizedId}`,
    "json",
  );
  if (storedRecord) {
    return storedRecord;
  }

  return (seedEvents as Event[]).find((event) => event.id === normalizedId) ?? null;
}

export async function saveEvent(env: Env, event: Event) {
  await env.VFC_SUBMISSIONS.put(`${EVENT_PREFIX}${event.id}`, JSON.stringify(event));
  await env.VFC_SUBMISSIONS.delete(`${EVENT_DELETED_PREFIX}${event.id}`);
}

export async function removeEvent(env: Env, id: string) {
  const existing = await getEventById(env, id);
  if (!existing) {
    return false;
  }

  await env.VFC_SUBMISSIONS.delete(`${EVENT_PREFIX}${id}`);
  await env.VFC_SUBMISSIONS.put(
    `${EVENT_DELETED_PREFIX}${id}`,
    JSON.stringify({ deletedAt: new Date().toISOString() }),
  );

  return true;
}
