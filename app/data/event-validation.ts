import type { Event } from "./types";

export type EventInput = {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  cafeId?: string;
  imageUrl?: string;
  mapUrl?: string;
  tags?: string[];
};

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_FORMAT_REGEX = /^\d{2}:\d{2}$/;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: unknown) {
  const normalized = normalizeString(value);
  return normalized || undefined;
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return null;
}

export function parseEventInput(body: unknown, requireAllFields: boolean) {
  if (!body || typeof body !== "object") {
    return { error: "Body must be a JSON object" };
  }

  const payload = body as Record<string, unknown>;
  const input: EventInput = {};

  const title = normalizeString(payload.title);
  if (title) {
    input.title = title;
  } else if (requireAllFields) {
    return { error: "title is required" };
  }

  const description = normalizeString(payload.description);
  if (description) {
    input.description = description;
  } else if (requireAllFields) {
    return { error: "description is required" };
  }

  const date = normalizeString(payload.date);
  if (date) {
    if (!DATE_FORMAT_REGEX.test(date)) {
      return { error: "date must be in YYYY-MM-DD format" };
    }
    input.date = date;
  } else if (requireAllFields) {
    return { error: "date is required" };
  }

  const time = normalizeString(payload.time);
  if (time) {
    if (!TIME_FORMAT_REGEX.test(time)) {
      return { error: "time must be in HH:MM format" };
    }
    input.time = time;
  } else if (requireAllFields) {
    return { error: "time is required" };
  }

  const location = normalizeString(payload.location);
  if (location) {
    input.location = location;
  } else if (requireAllFields) {
    return { error: "location is required" };
  }

  if ("cafeId" in payload) {
    input.cafeId = normalizeOptionalString(payload.cafeId);
  }

  if ("imageUrl" in payload) {
    input.imageUrl = normalizeOptionalString(payload.imageUrl);
  }

  if ("mapUrl" in payload) {
    input.mapUrl = normalizeOptionalString(payload.mapUrl);
  }

  if ("tags" in payload) {
    const parsedTags = normalizeTags(payload.tags);
    if (!parsedTags) {
      return { error: "tags must be an array of strings or a comma-separated string" };
    }
    input.tags = parsedTags;
  } else if (requireAllFields) {
    return { error: "tags is required" };
  }

  if (requireAllFields && (!input.tags || input.tags.length === 0)) {
    return { error: "tags must contain at least one tag" };
  }

  if (!requireAllFields && Object.keys(input).length === 0) {
    return { error: "At least one field must be provided" };
  }

  return { input };
}

export function applyEventInput(event: Event, input: EventInput): Event {
  return {
    ...event,
    ...input,
    id: event.id,
    createdAt: event.createdAt,
    tags: input.tags ?? event.tags,
  };
}
