import { describe, expect, it } from "vitest";
import { sortEvents } from "./events-store";
import type { Event } from "./types";

function makeEvent(overrides: Partial<Event>): Event {
  return {
    id: "test-event",
    title: "Test Event",
    description: "A test event",
    date: "2026-01-01",
    time: "10:00",
    location: "Test Cafe",
    status: "published",
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("sortEvents", () => {
  it("sorts valid event dates newest first", () => {
    const events = [
      makeEvent({ id: "oldest", date: "2026-01-01" }),
      makeEvent({ id: "newest", date: "2026-03-01" }),
      makeEvent({ id: "middle", date: "2026-02-01" }),
    ];

    expect(sortEvents(events).map((event) => event.id)).toEqual([
      "newest",
      "middle",
      "oldest",
    ]);
  });
});
