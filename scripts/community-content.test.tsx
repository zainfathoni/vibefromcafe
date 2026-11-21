import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import Home from "../app/routes/_index";
import Chapters from "../app/routes/chapters._index";
import { communities, jakartaMeetup } from "../app/data/chapters";
import events from "../app/data/events.json";
import cafes from "../app/data/cafes.json";
import { parseEventInput } from "../app/data/event-validation";

describe("community content consistency", () => {
  it.each([Home, Chapters])("shows current communities without coming-soon placeholders", (Page) => {
    const html = renderToStaticMarkup(<MemoryRouter><Page /></MemoryRouter>);
    for (const name of ["Jogja", ...communities.map((c) => c.name), jakartaMeetup.name]) {
      expect(html).toContain(name);
    }
    expect(html).not.toMatch(/coming soon/i);
    expect(html).toContain("Meetup presence");
  });

  it("keeps seed event IDs unique and validates backfilled logistics and cafe references", () => {
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
    for (const event of events) {
      // Archive records may have a known date but no exact start time.
      expect(event.title).toBeTruthy();
      expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(event.location).toBeTruthy();
      expect(parseEventInput(event, Boolean(event.time)).error).toBeUndefined();
      if (!event.time) expect(event.description).toContain("Jam mulai tepat tidak tercatat");
      if (event.cafeId) expect(cafes.some((cafe) => cafe.slug === event.cafeId)).toBe(true);
      expect(JSON.stringify(event)).not.toMatch(/chat\.whatsapp\.com|@s\.whatsapp\.net|@g\.us/);
    }
  });
});
