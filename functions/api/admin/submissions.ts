import type { InvitationStatus, Submission, SubmissionStatus } from "../join";

interface Env {
  DB: D1Database;
  WHATSAPP_GROUP_INVITE_URL?: string;
  WHATSAPP_INVITE_MESSAGE_TEMPLATE?: string;
}

type PatchBody = {
  invitationStatus?: SubmissionStatus | InvitationStatus;
};

type StoredRow = {
  id: string;
  name: string;
  city: string;
  city_id: string | null;
  role: string;
  role_other: string | null;
  company: string | null;
  is_freelancer: number;
  whatsapp: string;
  motivations: string;
  referral: string | null;
  referral_source: string | null;
  referral_name: string | null;
  invitation_status: string;
  invited_by: string | null;
  invited_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  ip: string | null;
  created_at: string;
};

const DEFAULT_WHATSAPP_INVITE_MESSAGE =
  "Hi {{name}}, welcome to Vibe From Cafe. Join our WhatsApp community here: {{group_link}}";

const SUBMISSION_STATUSES: SubmissionStatus[] = [
  "signed_up",
  "invited",
  "requested_to_join",
  "approved",
  "rejected",
];

const STATUS_FLOW: Record<SubmissionStatus, SubmissionStatus[]> = {
  signed_up:         ["signed_up", "invited"],
  invited:           ["invited", "requested_to_join"],
  requested_to_join: ["requested_to_join", "approved", "rejected"],
  approved:          ["approved"],
  rejected:          ["rejected"],
};

function deriveInviter(request: Request) {
  return (
    request.headers.get("cf-access-authenticated-user-email")?.trim() ||
    request.headers.get("cf-access-authenticated-user-name")?.trim() ||
    "admin"
  );
}

function getAllowedNextStatuses(current: SubmissionStatus): SubmissionStatus[] {
  return STATUS_FLOW[current] ?? [current];
}

function parseSubmissionStatus(value: unknown): SubmissionStatus | null {
  if (typeof value !== "string") return null;
  if (SUBMISSION_STATUSES.includes(value as SubmissionStatus)) return value as SubmissionStatus;
  if (value === "pending") return "signed_up";
  if (value === "joined") return "requested_to_join";
  if (value === "declined") return "rejected";
  return null;
}

function rowToSubmission(row: StoredRow): Submission {
  const status = parseSubmissionStatus(row.invitation_status) ?? "signed_up";
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    city_id: row.city_id ?? undefined,
    role: row.role,
    role_other: row.role_other ?? undefined,
    company: row.company ?? undefined,
    is_freelancer: row.is_freelancer === 1,
    whatsapp: row.whatsapp,
    motivations: JSON.parse(row.motivations || "[]") as string[],
    referral: row.referral ?? undefined,
    referralSource: row.referral_source ?? undefined,
    referralName: row.referral_name ?? undefined,
    invitationStatus: status,
    invited_by: row.invited_by ?? undefined,
    invited_at: row.invited_at ?? undefined,
    approved_by: row.approved_by ?? undefined,
    approved_at: row.approved_at ?? undefined,
    createdAt: row.created_at,
  };
}

function resolveInviteConfig(env: Env) {
  return {
    groupInviteUrl: env.WHATSAPP_GROUP_INVITE_URL?.trim() ?? "",
    messageTemplate: env.WHATSAPP_INVITE_MESSAGE_TEMPLATE?.trim() || DEFAULT_WHATSAPP_INVITE_MESSAGE,
  };
}

function canTransitionStatus(from: SubmissionStatus, to: SubmissionStatus) {
  return STATUS_FLOW[from].includes(to);
}

function extractSubmissionId(request: Request, params?: Record<string, string | string[] | undefined>) {
  const paramId = params?.id;
  if (typeof paramId === "string" && paramId.trim()) return paramId;
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/\/api\/admin\/submissions\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB
    .prepare("SELECT * FROM submissions ORDER BY created_at DESC")
    .all<StoredRow>();

  const submissions = results.map((row: StoredRow) => {
    const s = rowToSubmission(row);
    return { ...s, allowedNextStatuses: getAllowedNextStatuses(s.invitationStatus) };
  });

  return Response.json({ submissions, whatsappInvite: resolveInviteConfig(env) });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = extractSubmissionId(request, params);
  if (!id) {
    return Response.json({ error: "Submission id is required" }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetStatus = parseSubmissionStatus(body.invitationStatus);
  if (!targetStatus) {
    return Response.json(
      { error: "invitationStatus must be one of: signed_up, invited, requested_to_join, approved, rejected" },
      { status: 400 },
    );
  }

  const row = await env.DB
    .prepare("SELECT * FROM submissions WHERE id = ?")
    .bind(id)
    .first<StoredRow>();

  if (!row) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }

  const current = rowToSubmission(row);
  const currentStatus = current.invitationStatus;

  if (!canTransitionStatus(currentStatus, targetStatus)) {
    return Response.json(
      { error: `Invalid status transition: ${currentStatus} -> ${targetStatus}` },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const inviter = deriveInviter(request);

  const updated: Submission = { ...current, invitationStatus: targetStatus };
  if (currentStatus !== targetStatus && targetStatus === "invited") {
    updated.invited_by = inviter;
    updated.invited_at = now;
  }
  if (currentStatus !== targetStatus && targetStatus === "approved") {
    updated.approved_by = inviter;
    updated.approved_at = now;
  }

  await env.DB.prepare(`
    UPDATE submissions
    SET invitation_status = ?, invited_by = ?, invited_at = ?, approved_by = ?, approved_at = ?
    WHERE id = ?
  `).bind(
    targetStatus,
    updated.invited_by ?? null,
    updated.invited_at ?? null,
    updated.approved_by ?? null,
    updated.approved_at ?? null,
    id,
  ).run();

  return Response.json({ success: true, submission: updated });
};
