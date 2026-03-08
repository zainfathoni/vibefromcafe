import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Admin from "./admin";

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

function mockResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function mockSubmissionsApi(submissions: MockSubmission[]) {
  const fetchMock = vi.fn().mockResolvedValue(
    mockResponse({ submissions }),
  ) as unknown as typeof fetch;

  vi.stubGlobal("fetch", fetchMock);
}

describe("admin route", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders legacy incomplete submissions with safe defaults", async () => {
    mockSubmissionsApi([
      {
        id: "legacy-1",
        name: "Legacy User",
        city: "Yogyakarta",
        role: "Developer",
        createdAt: "2025-01-01T10:00:00.000Z",
      },
    ]);

    render(<Admin />);

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
    mockSubmissionsApi([
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
    ]);

    render(<Admin />);

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
    mockSubmissionsApi([
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
    ]);

    render(<Admin />);

    const withNameRow = (await screen.findByText("Friend With Name")).closest("tr");
    expect(withNameRow).not.toBeNull();
    if (!withNameRow) {
      return;
    }

    expect(within(withNameRow).getByText("A friend")).toBeInTheDocument();
    expect(within(withNameRow).getByText("Alex")).toBeInTheDocument();
  });

  it("shows '-' when referral source is friend but referral name is missing", async () => {
    mockSubmissionsApi([
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
    ]);

    render(<Admin />);

    const noNameRow = (await screen.findByText("Friend No Name")).closest("tr");
    expect(noNameRow).not.toBeNull();
    if (!noNameRow) {
      return;
    }

    expect(within(noNameRow).getByText("A friend")).toBeInTheDocument();
    expect(within(noNameRow).getByText("-")).toBeInTheDocument();
  });

  it("formats unknown referral source values", async () => {
    mockSubmissionsApi([
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
    ]);

    render(<Admin />);

    const row = (await screen.findByText("Unknown Referral")).closest("tr");
    expect(row).not.toBeNull();
    if (!row) {
      return;
    }

    expect(within(row).getByText("Newsletter Signup")).toBeInTheDocument();
  });

  it("shows an empty state when there are no submissions", async () => {
    mockSubmissionsApi([]);

    render(<Admin />);

    expect(await screen.findByText("No submissions found.")).toBeInTheDocument();
  });

  it("shows API error messages when submission loading fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ error: "Unable to reach submissions API" }, false),
    ) as unknown as typeof fetch;

    vi.stubGlobal("fetch", fetchMock);

    render(<Admin />);

    expect(await screen.findByText("Unable to reach submissions API")).toBeInTheDocument();
  });
});
