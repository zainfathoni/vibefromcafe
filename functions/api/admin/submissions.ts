import type { InvitationStatus, Submission } from "../join";

interface Env {
  VFC_SUBMISSIONS: KVNamespace;
}

type PatchBody = {
  invitationStatus?: InvitationStatus;
};

const SUBMISSION_PREFIX = "submission:";
const INVITATION_STATUSES: InvitationStatus[] = ["pending", "invited", "joined", "declined"];

function isInvitationStatus(value: unknown): value is InvitationStatus {
  return typeof value === "string" && INVITATION_STATUSES.includes(value as InvitationStatus);
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
      listing.keys.map((key) => env.VFC_SUBMISSIONS.get<Submission>(key.name, "json")),
    );

    for (const submission of batch) {
      if (submission) {
        submissions.push(submission);
      }
    }

    cursor = listing.list_complete ? undefined : listing.cursor;
  } while (cursor);

  submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return Response.json({ submissions });
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

  if (!isInvitationStatus(body.invitationStatus)) {
    return Response.json(
      { error: "invitationStatus must be one of: pending, invited, joined, declined" },
      { status: 400 },
    );
  }

  const key = `${SUBMISSION_PREFIX}${id}`;
  const current = await env.VFC_SUBMISSIONS.get<Submission>(key, "json");

  if (!current) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }

  const updated: Submission = {
    ...current,
    id,
    invitationStatus: body.invitationStatus,
  };

  await env.VFC_SUBMISSIONS.put(key, JSON.stringify(updated));

  return Response.json({ success: true, submission: updated });
};
