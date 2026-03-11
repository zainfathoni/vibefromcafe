import type { InvitationStatus, Submission, SubmissionStatus } from "../join";

interface Env {
  VFC_SUBMISSIONS: KVNamespace;
  WHATSAPP_GROUP_INVITE_URL?: string;
  WHATSAPP_INVITE_MESSAGE_TEMPLATE?: string;
}

type PatchBody = {
  invitationStatus?: SubmissionStatus | InvitationStatus;
};

type StoredSubmission = Omit<Submission, "invitationStatus"> & {
  invitationStatus?: SubmissionStatus | InvitationStatus;
};

const SUBMISSION_PREFIX = "submission:";
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
  signed_up: ["signed_up", "invited"],
  invited: ["invited", "requested_to_join"],
  requested_to_join: ["requested_to_join", "approved", "rejected"],
  approved: ["approved"],
  rejected: ["rejected"],
};

function deriveInviter(request: Request) {
  const email = request.headers.get("cf-access-authenticated-user-email")?.trim();
  if (email) {
    return email;
  }

  const name = request.headers.get("cf-access-authenticated-user-name")?.trim();
  if (name) {
    return name;
  }

  return "admin";
}

function getAllowedNextStatuses(current: SubmissionStatus): SubmissionStatus[] {
  return STATUS_FLOW[current] ?? [current];
}

function parseSubmissionStatus(value: unknown): SubmissionStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  if (SUBMISSION_STATUSES.includes(value as SubmissionStatus)) {
    return value as SubmissionStatus;
  }

  if (value === "pending") {
    return "signed_up";
  }

  if (value === "joined") {
    return "requested_to_join";
  }

  if (value === "declined") {
    return "rejected";
  }

  return null;
}

function normalizeSubmission(submission: StoredSubmission): Submission {
  return {
    ...submission,
    invitationStatus: parseSubmissionStatus(submission.invitationStatus) ?? "signed_up",
  };
}

function resolveInviteConfig(env: Env) {
  const groupInviteUrl = env.WHATSAPP_GROUP_INVITE_URL?.trim() ?? "";
  const messageTemplate =
    env.WHATSAPP_INVITE_MESSAGE_TEMPLATE?.trim() || DEFAULT_WHATSAPP_INVITE_MESSAGE;

  return {
    groupInviteUrl,
    messageTemplate,
  };
}

function canTransitionStatus(from: SubmissionStatus, to: SubmissionStatus) {
  return STATUS_FLOW[from].includes(to);
}

function extractSubmissionId(request: Request, params?: Record<string, string | string[] | undefined>) {
  const paramId = params?.id;
  if (typeof paramId === "string" && paramId.trim()) {
    return paramId;
  }

  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/\/api\/admin\/submissions\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const submissions: Submission[] = [];

  let cursor: string | undefined;
  do {
    const listing = await env.VFC_SUBMISSIONS.list({
      prefix: SUBMISSION_PREFIX,
      cursor,
      limit: 1000,
    });

    const batch = await Promise.all(
      listing.keys.map((key) => env.VFC_SUBMISSIONS.get<StoredSubmission>(key.name, "json")),
    );

    for (const submission of batch) {
      if (submission) {
        const normalized = normalizeSubmission(submission);
        submissions.push({
          ...normalized,
          allowedNextStatuses: getAllowedNextStatuses(normalized.invitationStatus),
        });
      }
    }

    cursor = listing.list_complete ? undefined : listing.cursor;
  } while (cursor);

  submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return Response.json({ submissions, whatsappInvite: resolveInviteConfig(env) });
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
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
      {
        error:
          "invitationStatus must be one of: signed_up, invited, requested_to_join, approved, rejected (legacy: pending, joined, declined also accepted)",
      },
      { status: 400 },
    );
  }

  const key = `${SUBMISSION_PREFIX}${id}`;
  const storedCurrent = await env.VFC_SUBMISSIONS.get<StoredSubmission>(key, "json");

  if (!storedCurrent) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }

  const current = normalizeSubmission(storedCurrent);
  const currentStatus = current.invitationStatus;

  if (!canTransitionStatus(currentStatus, targetStatus)) {
    return Response.json(
      {
        error: `Invalid status transition: ${currentStatus} -> ${targetStatus}`,
      },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const inviter = deriveInviter(request);

  const updated: Submission = {
    ...current,
    id,
    invitationStatus: targetStatus,
  };

  if (currentStatus !== targetStatus && targetStatus === "invited") {
    updated.invited_by = inviter;
    updated.invited_at = now;
  }

  if (currentStatus !== targetStatus && targetStatus === "approved") {
    updated.approved_by = inviter;
    updated.approved_at = now;
  }

  await env.VFC_SUBMISSIONS.put(key, JSON.stringify(updated));

  return Response.json({ success: true, submission: updated });
};
