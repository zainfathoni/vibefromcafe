import { describe, expect, it, vi } from "vitest";

import { onRequestGet, onRequestPatch } from "./submissions";

class MockKvNamespace {
  private readonly store = new Map<string, string>();

  seed(key: string, value: unknown) {
    this.store.set(key, JSON.stringify(value));
  }

  async get<T>(key: string, type?: "json") {
    const value = this.store.get(key);
    if (!value) {
      return null;
    }

    if (type === "json") {
      return JSON.parse(value) as T;
    }

    return value as T;
  }

  async put(key: string, value: string) {
    this.store.set(key, value);
  }

  async list(options: { prefix: string }) {
    const keys = [...this.store.keys()]
      .filter((key) => key.startsWith(options.prefix))
      .map((name) => ({ name }));

    return {
      keys,
      list_complete: true,
      cursor: "",
    };
  }
}

function createContext({
  request,
  env,
}: {
  request: Request;
  env: Record<string, unknown>;
}) {
  return {
    request,
    env,
    params: {},
    data: {},
    next: vi.fn(),
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  } as unknown as Parameters<typeof onRequestGet>[0];
}

describe("admin submissions api", () => {
  it("returns normalized statuses and WhatsApp invite config", async () => {
    const kv = new MockKvNamespace();
    kv.seed("submission:legacy", {
      id: "legacy",
      name: "Legacy",
      city: "Jogja",
      role: "Developer",
      whatsapp: "628111222333",
      referralSource: "instagram",
      invitationStatus: "pending",
      createdAt: "2025-01-01T10:00:00.000Z",
    });

    const response = await onRequestGet(
      createContext({
        request: new Request("https://example.com/api/admin/submissions"),
        env: {
          VFC_SUBMISSIONS: kv,
          WHATSAPP_GROUP_INVITE_URL: "https://chat.whatsapp.com/vfc-group",
          WHATSAPP_INVITE_MESSAGE_TEMPLATE: "Hi {{name}} {{group_link}}",
        },
      }),
    );

    const body = (await response.json()) as {
      submissions: Array<{ invitationStatus: string }>;
      whatsappInvite: { groupInviteUrl: string; messageTemplate: string };
    };

    expect(body.submissions[0]?.invitationStatus).toBe("signed_up");
    expect(body.whatsappInvite).toEqual({
      groupInviteUrl: "https://chat.whatsapp.com/vfc-group",
      messageTemplate: "Hi {{name}} {{group_link}}",
    });
  });

  it("moves signed_up to invited and records inviter metadata", async () => {
    const kv = new MockKvNamespace();
    kv.seed("submission:test-1", {
      id: "test-1",
      name: "First Invite",
      city: "Jogja",
      role: "Engineer",
      whatsapp: "628111222333",
      referralSource: "friend",
      invitationStatus: "signed_up",
      createdAt: "2025-01-01T10:00:00.000Z",
    });

    const response = await onRequestPatch(
      createContext({
        request: new Request("https://example.com/api/admin/submissions/test-1", {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "cf-access-authenticated-user-email": "admin@vfc.id",
          },
          body: JSON.stringify({ invitationStatus: "invited" }),
        }),
        env: { VFC_SUBMISSIONS: kv },
      }),
    );

    const body = (await response.json()) as {
      submission: {
        invitationStatus: string;
        invited_by?: string;
        invited_at?: string;
      };
    };

    expect(response.status).toBe(200);
    expect(body.submission.invitationStatus).toBe("invited");
    expect(body.submission.invited_by).toBe("admin@vfc.id");
    expect(body.submission.invited_at).toBeTruthy();
  });

  it("moves joined to approved and records approver metadata", async () => {
    const kv = new MockKvNamespace();
    kv.seed("submission:test-2", {
      id: "test-2",
      name: "Approve User",
      city: "Jogja",
      role: "Engineer",
      whatsapp: "628111222444",
      referralSource: "instagram",
      invitationStatus: "requested_to_join",
      invited_by: "admin@vfc.id",
      invited_at: "2025-01-01T10:00:00.000Z",
      createdAt: "2025-01-01T09:00:00.000Z",
    });

    const response = await onRequestPatch(
      createContext({
        request: new Request("https://example.com/api/admin/submissions/test-2", {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "cf-access-authenticated-user-email": "approver@vfc.id",
          },
          body: JSON.stringify({ invitationStatus: "approved" }),
        }),
        env: { VFC_SUBMISSIONS: kv },
      }),
    );

    const body = (await response.json()) as {
      submission: {
        invitationStatus: string;
        approved_by?: string;
        approved_at?: string;
      };
    };

    expect(response.status).toBe(200);
    expect(body.submission.invitationStatus).toBe("approved");
    expect(body.submission.approved_by).toBe("approver@vfc.id");
    expect(body.submission.approved_at).toBeTruthy();
  });

  it("rejects invalid status transitions", async () => {
    const kv = new MockKvNamespace();
    kv.seed("submission:test-3", {
      id: "test-3",
      name: "Invalid Flow",
      city: "Jogja",
      role: "Engineer",
      whatsapp: "628111222555",
      referralSource: "instagram",
      invitationStatus: "signed_up",
      createdAt: "2025-01-01T10:00:00.000Z",
    });

    const response = await onRequestPatch(
      createContext({
        request: new Request("https://example.com/api/admin/submissions/test-3", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ invitationStatus: "approved" }),
        }),
        env: { VFC_SUBMISSIONS: kv },
      }),
    );

    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(body.error).toContain("Invalid status transition");
  });
});
