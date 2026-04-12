import { describe, expect, it, vi } from "vitest";
import { focusEventFromHash, getEventIdFromHash, resolveEventImage, resolveEventMapUrl } from "./events._index";
import type { Event } from "../data/types";

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "test-1",
    title: "Test Event",
    description: "A test event",
    date: "2026-03-15",
    time: "19:00",
    location: "Test Cafe, Yogyakarta",
    status: "published",
    tags: [],
    createdAt: "2026-03-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("resolveEventImage", () => {
  it("returns event imageUrl when set", () => {
    const event = makeEvent({ imageUrl: "/events/custom.jpg", cafeId: "the-bean-garden-palagan" });
    expect(resolveEventImage(event)).toBe("/events/custom.jpg");
  });

  it("falls back to cafe imageUrl when event has none", () => {
    const event = makeEvent({ cafeId: "the-bean-garden-palagan" });
    expect(resolveEventImage(event)).toBe("/events/the-bean-garden-palagan.jpg");
  });

  it("returns undefined when no event image and no cafeId", () => {
    const event = makeEvent();
    expect(resolveEventImage(event)).toBeUndefined();
  });

  it("returns undefined when cafeId does not match any cafe", () => {
    const event = makeEvent({ cafeId: "non-existent-cafe" });
    expect(resolveEventImage(event)).toBeUndefined();
  });

  it("rejects unsafe imageUrl schemes", () => {
    const event = makeEvent({ imageUrl: "javascript:alert(1)" });
    expect(resolveEventImage(event)).toBeUndefined();
  });

  it("allows relative paths for imageUrl", () => {
    const event = makeEvent({ imageUrl: "/events/photo.jpg" });
    expect(resolveEventImage(event)).toBe("/events/photo.jpg");
  });
});

describe("resolveEventMapUrl", () => {
  it("returns event mapUrl when set", () => {
    const event = makeEvent({ mapUrl: "https://maps.app.goo.gl/custom", cafeId: "the-bean-garden-palagan" });
    expect(resolveEventMapUrl(event)).toBe("https://maps.app.goo.gl/custom");
  });

  it("falls back to cafe mapUrl when event has none", () => {
    const event = makeEvent({ cafeId: "the-bean-garden-palagan" });
    expect(resolveEventMapUrl(event)).toBe("https://maps.app.goo.gl/YQyQK2oAxJJLTa4F7");
  });

  it("returns undefined when no event mapUrl and no cafeId", () => {
    const event = makeEvent();
    expect(resolveEventMapUrl(event)).toBeUndefined();
  });

  it("rejects unsafe mapUrl schemes", () => {
    const event = makeEvent({ mapUrl: "javascript:alert(1)" });
    expect(resolveEventMapUrl(event)).toBeUndefined();
  });

  it("rejects data: URLs", () => {
    const event = makeEvent({ mapUrl: "data:text/html,<script>alert(1)</script>" });
    expect(resolveEventMapUrl(event)).toBeUndefined();
  });
});

describe("getEventIdFromHash", () => {
  it("returns an id for valid hashes", () => {
    expect(getEventIdFromHash("#event-1")).toBe("event-1");
    expect(getEventIdFromHash("#2b563565-cb1c-47e8-aa9c-23621d91ac42")).toBe("2b563565-cb1c-47e8-aa9c-23621d91ac42");
  });

  it("rejects empty or invalid hashes", () => {
    expect(getEventIdFromHash("#")).toBeNull();
    expect(getEventIdFromHash("javascript:alert(1)")).toBeNull();
  });
});

describe("focusEventFromHash", () => {
  it("focuses the matching event card", () => {
    const element = document.createElement("article");
    element.id = "event-1";
    element.dataset.eventCard = "true";
    element.tabIndex = -1;
    element.scrollIntoView = vi.fn();
    document.body.appendChild(element);

    const result = focusEventFromHash("#event-1");

    expect(result).toBe(true);
    expect(element.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(element);
  });

  it("ignores hashes that do not match event cards", () => {
    const element = document.createElement("article");
    element.id = "not-an-event";
    document.body.appendChild(element);

    expect(focusEventFromHash("#not-an-event")).toBe(false);
  });
});
