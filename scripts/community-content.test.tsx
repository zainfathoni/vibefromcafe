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
      expect(parseEventInput(event, true).error).toBeUndefined();
      if (event.cafeId) expect(cafes.some((cafe) => cafe.slug === event.cafeId)).toBe(true);
      expect(JSON.stringify(event)).not.toMatch(/chat\.whatsapp\.com|@s\.whatsapp\.net|@g\.us/);
    }
  });
});
