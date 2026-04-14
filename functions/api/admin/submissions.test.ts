import { describe, expect, it, vi } from "vitest";

import { onRequestGet, onRequestPatch } from "./submissions";

// ─── Minimal D1 mock ──────────────────────────────────────────────────────────

type Row = Record<string, unknown>;

class MockD1Statement {
  private _params: unknown[] = [];

  constructor(
    private readonly db: MockD1Database,
    private readonly sql: string,
  ) {}

  bind(...args: unknown[]): this {
    this._params = args;
    return this;
  }

  async run(): Promise<{ success: boolean }> {
    this.db._execute(this.sql, this._params);
    return { success: true };
  }

  async first<T extends Row = Row>(): Promise<T | null> {
    return this.db._first<T>(this.sql, this._params);
  }

  async all<T extends Row = Row>(): Promise<{ results: T[]; success: boolean }> {
    return { results: this.db._all<T>(this.sql, this._params), success: true };
  }
}

class MockD1Database {
  private readonly rows = new Map<string, Row>();

  seed(row: Row) {
    this.rows.set(row.id as string, row);
  }

  prepare(sql: string): MockD1Statement {
    return new MockD1Statement(this, sql);
  }

  async batch(stmts: MockD1Statement[]): Promise<Array<{ success: boolean }>> {
    for (const stmt of stmts) await stmt.run();
    return stmts.map(() => ({ success: true }));
  }

  _execute(sql: string, params: unknown[]): void {
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith("UPDATE SUBMISSIONS")) {
      // UPDATE submissions SET invitation_status=?, invited_by=?, invited_at=?, approved_by=?, approved_at=? WHERE id=?
      const id = params[params.length - 1] as string;
      const row = this.rows.get(id);
      if (!row) return;
      this.rows.set(id, {
        ...row,
        invitation_status: params[0],
        invited_by:        params[1],
        invited_at:        params[2],
        approved_by:       params[3],
        approved_at:       params[4],
      });
    }
  }

  _first<T extends Row>(sql: string, params: unknown[]): T | null {
    if (/FROM SUBMISSIONS WHERE ID = \?/i.test(sql)) {
      return (this.rows.get(params[0] as string) as T | undefined) ?? null;
    }
    return null;
  }

  _all<T extends Row>(sql: string, _params: unknown[]): T[] {
    if (/FROM SUBMISSIONS/i.test(sql)) {
      return Array.from(this.rows.values()).sort(
        (a, b) =>
          new Date(b.created_at as string).getTime() -
          new Date(a.created_at as string).getTime(),
      ) as T[];
    }
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// Seed a submission in D1 row format (snake_case columns)
function makeRow(overrides: Partial<Row> = {}): Row {
  return {
    id: "test-id",
    name: "Test User",
    city: "Jogja",
    city_id: null,
    role: "Developer",
    role_other: null,
    company: null,
    is_freelancer: 0,
    whatsapp: "628111222333",
    motivations: "[]",
    referral: null,
    referral_source: null,
    referral_name: null,
    invitation_status: "signed_up",
    invited_by: null,
    invited_at: null,
    approved_by: null,
    approved_at: null,
    ip: null,
    created_at: "2025-01-01T10:00:00.000Z",
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("admin submissions api", () => {
  it("returns normalized statuses and WhatsApp invite config", async () => {
    const db = new MockD1Database();
    db.seed(makeRow({ id: "legacy", invitation_status: "pending" }));

    const response = await onRequestGet(
      createContext({
        request: new Request("https://example.com/api/admin/submissions"),
        env: {
          DB: db,
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
    const db = new MockD1Database();
    db.seed(makeRow({ id: "test-1", invitation_status: "signed_up" }));

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
        env: { DB: db },
      }),
    );

    const body = (await response.json()) as {
      submission: { invitationStatus: string; invited_by?: string; invited_at?: string };
    };

    expect(response.status).toBe(200);
    expect(body.submission.invitationStatus).toBe("invited");
    expect(body.submission.invited_by).toBe("admin@vfc.id");
    expect(body.submission.invited_at).toBeTruthy();
  });

  it("moves requested_to_join to approved and records approver metadata", async () => {
    const db = new MockD1Database();
    db.seed(makeRow({
      id: "test-2",
      invitation_status: "requested_to_join",
      invited_by: "admin@vfc.id",
      invited_at: "2025-01-01T10:00:00.000Z",
    }));

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
        env: { DB: db },
      }),
    );

    const body = (await response.json()) as {
      submission: { invitationStatus: string; approved_by?: string; approved_at?: string };
    };

    expect(response.status).toBe(200);
    expect(body.submission.invitationStatus).toBe("approved");
    expect(body.submission.approved_by).toBe("approver@vfc.id");
    expect(body.submission.approved_at).toBeTruthy();
  });

  it("rejects invalid status transitions", async () => {
    const db = new MockD1Database();
    db.seed(makeRow({ id: "test-3", invitation_status: "signed_up" }));

    const response = await onRequestPatch(
      createContext({
        request: new Request("https://example.com/api/admin/submissions/test-3", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ invitationStatus: "approved" }),
        }),
        env: { DB: db },
      }),
    );

    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(body.error).toContain("Invalid status transition");
  });
});
