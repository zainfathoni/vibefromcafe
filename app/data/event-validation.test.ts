import { describe, expect, it } from "vitest";

import { applyEventInput, parseEventInput } from "./event-validation";
import type { Event } from "./types";

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "vfc-jogja-meetup",
    title: "VFC Jogja Meetup",
    description: "Community coworking session.",
    date: "2026-05-13",
    time: "19:00",
    location: "Yogyakarta",
    status: "published",
    tags: ["coworking"],
    createdAt: "2026-05-13T00:00:00.000Z",
    ...overrides,
  };
}

describe("parseEventInput", () => {
  it("accepts an optional public source label", () => {
    const parsed = parseEventInput(
      {
        title: "VFC Jogja Meetup",
        description: "Community coworking session.",
        date: "2026-05-13",
        time: "19:00",
        location: "Yogyakarta",
        sourceLabel: "Source: VFC Jogja community announcement",
        tags: ["coworking"],
      },
      true,
    );

    expect(parsed).toEqual({
      input: expect.objectContaining({
        sourceLabel: "Source: VFC Jogja community announcement",
      }),
    });
  });

  it("normalizes a blank source label to undefined", () => {
    const parsed = parseEventInput({ sourceLabel: "   " }, false);

    expect(parsed).toEqual({ input: { sourceLabel: undefined } });
  });
});

describe("applyEventInput", () => {
  it("updates source labels without changing createdAt", () => {
    const event = makeEvent();
    const updated = applyEventInput(event, {
      sourceLabel: "Source: VFC Jogja community announcement",
    });

    expect(updated.sourceLabel).toBe("Source: VFC Jogja community announcement");
    expect(updated.createdAt).toBe(event.createdAt);
  });
});
