import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Admin from "./admin._index";

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
  invitationStatus?: "signed_up" | "invited" | "approved" | "requested_to_join" | "rejected";
  invited_by?: string;
  invited_at?: string;
  approved_by?: string;
  approved_at?: string;
  createdAt: string;
};

type MockWhatsappInvite = {
  groupInviteUrl?: string;
  messageTemplate?: string;
};

const MOCK_STATUS_FLOW: Record<string, string[]> = {
  signed_up: ["signed_up", "invited"],
  invited: ["invited", "requested_to_join"],
  joined: ["requested_to_join", "approved", "rejected"],
  approved: ["approved"],
  rejected: ["rejected"],
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
  whatsappInvite?: MockWhatsappInvite;
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
  whatsappInvite = {
    groupInviteUrl: "https://chat.whatsapp.com/default-invite",
    messageTemplate:
      "Hi {{name}}, welcome to Vibe From Cafe. Join our WhatsApp community here: {{group_link}}",
  },
  events = [],
  eventsOk = true,
  eventsError = "Failed to load events",
}: MockAdminApisOptions = {}) {
  const submissionsStore = new Map(submissions.map((submission) => [submission.id, submission]));

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = init?.method ?? "GET";

    if (url === "/api/admin/submissions" && method === "GET") {
      return Promise.resolve(
        mockResponse(
          submissionsOk
            ? {
                submissions: [...submissionsStore.values()].map((s) => ({
                  ...s,
                  allowedNextStatuses: MOCK_STATUS_FLOW[s.invitationStatus ?? "signed_up"] ?? ["signed_up"],
                })),
                whatsappInvite,
              }
            : { error: submissionsError },
          submissionsOk,
        ),
      );
    }

    if (url.includes("/api/admin/submissions/") && method === "PATCH") {
      const id = url.split("/api/admin/submissions/")[1];
      const current = submissionsStore.get(id);

      if (!current) {
        return Promise.resolve(mockResponse({ error: "Submission not found" }, false));
      }

      const body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
      const updated = {
        ...current,
        invitationStatus: body.invitationStatus,
      };

      submissionsStore.set(id, updated);

      return Promise.resolve(
        mockResponse({ success: true, submission: updated }),
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
  return fetchMock;
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
    expect(within(row).getAllByText("-")).toHaveLength(5);
    expect(within(row).getByRole("combobox")).toHaveValue("signed_up");
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

  it("builds a wa.me invite link from configurable template and group URL", async () => {
    mockAdminApis({
      submissions: [
        {
          id: "invite-link-1",
          name: "Invite Target",
          city: "Bandung",
          role: "Builder",
          whatsapp: "0812-3456-789",
          referralSource: "instagram",
          invitationStatus: "signed_up",
          createdAt: "2025-01-02T11:00:00.000Z",
        },
      ],
      whatsappInvite: {
        groupInviteUrl: "https://chat.whatsapp.com/test-group-link",
        messageTemplate: "Halo {{name}}, gabung grup: {{group_link}}",
      },
    });

    renderAdmin();

    const whatsappLink = await screen.findByRole("link", { name: "0812-3456-789" });
    expect(whatsappLink).toHaveAttribute("target", "_blank");
    expect(whatsappLink).toHaveAttribute(
      "href",
      `https://wa.me/628123456789?text=${encodeURIComponent("Halo Invite Target, gabung grup: https://chat.whatsapp.com/test-group-link")}`,
    );
  });

  it("marks signed-up submissions as invited when WhatsApp number is clicked", async () => {
    const fetchMock = mockAdminApis({
      submissions: [
        {
          id: "invite-click-1",
          name: "Click Invite",
          city: "Yogyakarta",
          role: "Engineer",
          whatsapp: "628120000111",
          referralSource: "friend",
          invitationStatus: "signed_up",
          createdAt: "2025-01-07T10:00:00.000Z",
        },
      ],
    });

    renderAdmin();

    const whatsappLink = await screen.findByRole("link", { name: "628120000111" });
    await userEvent.click(whatsappLink);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/submissions/invite-click-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ invitationStatus: "invited" }),
      }),
    );
    expect(await screen.findByRole("combobox")).toHaveValue("invited");
  });

  it("shows invited and approved audit fields", async () => {
    mockAdminApis({
      submissions: [
        {
          id: "audit-1",
          name: "Audit User",
          city: "Jakarta",
          role: "Operator",
          whatsapp: "628123123123",
          referralSource: "instagram",
          invitationStatus: "approved",
          invited_by: "inviter@vfc.id",
          invited_at: "2025-01-02T11:00:00.000Z",
          approved_by: "approver@vfc.id",
          approved_at: "2025-01-03T12:30:00.000Z",
          createdAt: "2025-01-01T10:00:00.000Z",
        },
      ],
    });

    renderAdmin();

    const row = (await screen.findByText("Audit User")).closest("tr");
    expect(row).not.toBeNull();
    if (!row) {
      return;
    }

    expect(within(row).getByText(/inviter@vfc.id/)).toBeInTheDocument();
    expect(within(row).getByText(/approver@vfc.id/)).toBeInTheDocument();
  });

  it("shows only valid next statuses for each submission", async () => {
    mockAdminApis({
      submissions: [
        {
          id: "flow-1",
          name: "Flow User",
          city: "Jakarta",
          role: "Maker",
          whatsapp: "628123000111",
          referralSource: "instagram",
          invitationStatus: "signed_up",
          createdAt: "2025-01-02T11:00:00.000Z",
        },
      ],
    });

    renderAdmin();

    const statusSelect = await screen.findByRole("combobox");
    const options = within(statusSelect).getAllByRole("option");
    const values = options.map((option) => option.getAttribute("value"));

    expect(values).toEqual(["signed_up", "invited"]);
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
        invitationStatus: "signed_up",
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
        invitationStatus: "signed_up",
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
    expect(within(noNameRow).getAllByText("-").length).toBeGreaterThan(0);
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
        invitationStatus: "signed_up",
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

  it("renders cafes directory section with cafe data", async () => {
    mockAdminApis();
    renderAdmin();

    expect(await screen.findByText("Cafes Directory")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search cafes…")).toBeInTheDocument();
    expect(screen.getByText("Total cafes")).toBeInTheDocument();
  });

  it("filters cafes by search input", async () => {
    mockAdminApis();
    renderAdmin();

    const searchInput = await screen.findByPlaceholderText("Search cafes…");
    await userEvent.type(searchInput, "bean garden");

    expect(screen.getByText("The Bean Garden Palagan")).toBeInTheDocument();
    expect(screen.getByText("1 matching")).toBeInTheDocument();
  });

  it("shows image and map status for cafes with those fields", async () => {
    mockAdminApis();
    renderAdmin();

    // The Bean Garden Palagan has imageUrl and mapUrl
    const row = (await screen.findByText("The Bean Garden Palagan")).closest("tr");
    expect(row).not.toBeNull();
    if (!row) return;

    expect(within(row).getByText("Yes")).toBeInTheDocument();
    expect(within(row).getByText("Link")).toBeInTheDocument();
  });
});
