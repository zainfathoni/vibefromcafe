import { describe, expect, it, vi } from "vitest";

import { onRequestPost } from "./join";

class MockKvNamespace {
  private readonly store = new Map<string, string>();

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

  entries() {
    return [...this.store.entries()];
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
  } as unknown as Parameters<typeof onRequestPost>[0];
}

describe("join api", () => {
  it("stores successful submissions as invited and returns WhatsApp invite config", async () => {
    const kv = new MockKvNamespace();

    const response = await onRequestPost(
      createContext({
        request: new Request("https://example.com/api/join", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: "Immediate Invite",
            city: "Jogja",
            role: "Developer",
            whatsapp: "0812-3456-789",
            referralSource: "instagram",
          }),
        }),
        env: {
          VFC_SUBMISSIONS: kv,
          WHATSAPP_GROUP_INVITE_URL: "https://chat.whatsapp.com/vfc-group",
          WHATSAPP_INVITE_MESSAGE_TEMPLATE: "Hi {{name}}, join {{group_link}}",
        },
      }),
    );

    const body = (await response.json()) as {
      success: boolean;
      submission: { id: string; invitationStatus: string };
      whatsappInvite: { groupInviteUrl: string; messageTemplate: string };
    };
    const [[key, storedValue]] = kv.entries();
    const stored = JSON.parse(storedValue) as {
      id: string;
      invitationStatus: string;
      invited_by?: string;
      invited_at?: string;
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.submission).toEqual({ id: stored.id, invitationStatus: "invited" });
    expect(body.whatsappInvite).toEqual({
      groupInviteUrl: "https://chat.whatsapp.com/vfc-group",
      messageTemplate: "Hi {{name}}, join {{group_link}}",
    });
    expect(key).toBe(`submission:${stored.id}`);
    expect(stored.invitationStatus).toBe("invited");
    expect(stored.invited_by).toBeUndefined();
    expect(stored.invited_at).toBeTruthy();
  });
});
