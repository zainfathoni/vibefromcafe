import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Admin from "./admin";

function renderAdmin() {
  render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>,
  );
}

type MockSubmission = {
  id: string;
  name: string;
  city: string;
  role: string;
  whatsapp?: string;
  referralSource?: string;
  referralName?: string;
  invitationStatus?: "pending" | "invited" | "joined" | "declined";
  createdAt: string;
};

type MockEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
  createdAt: string;
};

type MockAdminApisOptions = {
  submissions?: MockSubmission[];
  submissionsOk?: boolean;
  submissionsError?: string;
  events?: MockEvent[];
  eventsOk?: boolean;
  eventsError?: string;
};

function mockResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function mockAdminApis({
  submissions = [],
  submissionsOk = true,
  submissionsError = "Failed to load submissions",
  events = [],
  eventsOk = true,
  eventsError = "Failed to load events",
}: MockAdminApisOptions = {}) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (url.includes("/api/admin/submissions")) {
      return Promise.resolve(
        mockResponse(
          submissionsOk ? { submissions } : { error: submissionsError },
          submissionsOk,
        ),
      );
    }

    if (url.includes("/api/admin/events")) {
      return Promise.resolve(
        mockResponse(
          eventsOk ? { events } : { error: eventsError },
          eventsOk,
        ),
      );
    }

    return Promise.reject(new Error(`Unhandled fetch request in test: ${url}`));
  }) as unknown as typeof fetch;

  vi.stubGlobal("fetch", fetchMock);
}

describe("admin route", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders legacy incomplete submissions with safe defaults", async () => {
    mockAdminApis({
      submissions: [
      {
        id: "legacy-1",
        name: "Legacy User",
        city: "Yogyakarta",
        role: "Developer",
        createdAt: "2025-01-01T10:00:00.000Z",
      },
      ],
    });

    renderAdmin();

    const nameCell = await screen.findByText("Legacy User");
    const row = nameCell.closest("tr");

    expect(row).not.toBeNull();
    if (!row) {
      return;
    }

    expect(within(row).getByText("Yogyakarta")).toBeInTheDocument();
    expect(within(row).getByText("Developer")).toBeInTheDocument();
    expect(within(row).getAllByText("-")).toHaveLength(3);
    expect(within(row).getByRole("combobox")).toHaveValue("pending");
  });

  it("renders submissions with complete data correctly", async () => {
    mockAdminApis({
      submissions: [
      {
        id: "full-1",
        name: "Complete User",
        city: "Bandung",
        role: "Designer",
        whatsapp: "628123456789",
        referralSource: "instagram",
        referralName: "Nadia",
        invitationStatus: "invited",
        createdAt: "2025-01-02T11:00:00.000Z",
      },
      ],
    });

    renderAdmin();

    const row = (await screen.findByText("Complete User")).closest("tr");
    expect(row).not.toBeNull();
    if (!row) {
      return;
    }

    expect(within(row).getByText("Bandung")).toBeInTheDocument();
    expect(within(row).getByText("Designer")).toBeInTheDocument();
    expect(within(row).getByText("628123456789")).toBeInTheDocument();
    expect(within(row).getByText("Instagram")).toBeInTheDocument();
    expect(within(row).getByText("Nadia")).toBeInTheDocument();
    expect(within(row).getByRole("combobox")).toHaveValue("invited");
  });

  it("shows referral name when referral source is friend and name is present", async () => {
    mockAdminApis({
      submissions: [
      {
        id: "friend-with-name",
        name: "Friend With Name",
        city: "Jakarta",
        role: "Writer",
        whatsapp: "628987654321",
        referralSource: "friend",
        referralName: "Alex",
        invitationStatus: "pending",
        createdAt: "2025-01-03T12:00:00.000Z",
      },
      ],
    });

    renderAdmin();

    const withNameRow = (await screen.findByText("Friend With Name")).closest("tr");
    expect(withNameRow).not.toBeNull();
    if (!withNameRow) {
      return;
    }

    expect(within(withNameRow).getByText("A friend")).toBeInTheDocument();
    expect(within(withNameRow).getByText("Alex")).toBeInTheDocument();
  });

  it("shows '-' when referral source is friend but referral name is missing", async () => {
    mockAdminApis({
      submissions: [
      {
        id: "friend-no-name",
        name: "Friend No Name",
        city: "Solo",
        role: "Engineer",
        whatsapp: "628555000111",
        referralSource: "friend",
        invitationStatus: "pending",
        createdAt: "2025-01-04T13:00:00.000Z",
      },
      ],
    });

    renderAdmin();

    const noNameRow = (await screen.findByText("Friend No Name")).closest("tr");
    expect(noNameRow).not.toBeNull();
    if (!noNameRow) {
      return;
    }

    expect(within(noNameRow).getByText("A friend")).toBeInTheDocument();
    expect(within(noNameRow).getByText("-")).toBeInTheDocument();
  });

  it("formats unknown referral source values", async () => {
    mockAdminApis({
      submissions: [
      {
        id: "unknown-referral",
        name: "Unknown Referral",
        city: "Semarang",
        role: "PM",
        whatsapp: "628111222333",
        referralSource: "newsletter_signup",
        invitationStatus: "pending",
        createdAt: "2025-01-05T14:00:00.000Z",
      },
      ],
    });

    renderAdmin();

    const row = (await screen.findByText("Unknown Referral")).closest("tr");
    expect(row).not.toBeNull();
    if (!row) {
      return;
    }

    expect(within(row).getByText("Newsletter Signup")).toBeInTheDocument();
  });

  it("shows an empty state when there are no submissions", async () => {
    mockAdminApis();

    renderAdmin();

    expect(await screen.findByText("No submissions found.")).toBeInTheDocument();
  });

  it("shows API error messages when submission loading fails", async () => {
    mockAdminApis({
      submissionsOk: false,
      submissionsError: "Unable to reach submissions API",
    });

    renderAdmin();

    expect(await screen.findByText("Unable to reach submissions API")).toBeInTheDocument();
  });

  it("renders events section with loaded events", async () => {
    mockAdminApis({
      events: [
        {
          id: "event-1",
          title: "Vibe Coding Night #4",
          description: "Build together and ship features.",
          date: "2026-03-21",
          time: "19:00",
          location: "Bilik Kayu Heritage, Yogyakarta",
          tags: ["vibe coding", "networking"],
          createdAt: "2026-03-10T12:00:00.000Z",
        },
      ],
    });

    renderAdmin();

    expect(await screen.findByText("Vibe Coding Night #4")).toBeInTheDocument();
    expect(screen.getByText("Bilik Kayu Heritage, Yogyakarta")).toBeInTheDocument();
    expect(screen.getByText("vibe coding, networking")).toBeInTheDocument();
  });

  it("shows an empty state when there are no events", async () => {
    mockAdminApis({
      events: [],
    });

    renderAdmin();

    expect(await screen.findByText("No events found.")).toBeInTheDocument();
  });

  it("shows API error messages when events loading fails", async () => {
    mockAdminApis({
      eventsOk: false,
      eventsError: "Events API unavailable",
    });

    renderAdmin();

    expect(
      await screen.findByText("Failed to load events: Events API unavailable"),
    ).toBeInTheDocument();
  });
});
