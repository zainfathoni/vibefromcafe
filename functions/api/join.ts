interface Env {
  VFC_SUBMISSIONS: KVNamespace;
  WHATSAPP_GROUP_INVITE_URL?: string;
  WHATSAPP_INVITE_MESSAGE_TEMPLATE?: string;
}

interface SubmissionBody {
  name: string;
  city: string;
  role: string;
  whatsapp: string;
  referralSource: string;
  referralName?: string;
}

export type InvitationStatus = "pending" | "invited" | "requested_to_join" | "declined";

export type SubmissionStatus =
  | "signed_up"
  | "invited"
  | "requested_to_join"
  | "approved"
  | "rejected";

export interface Submission {
  id: string;
  name: string;
  city: string;
  role: string;
  whatsapp: string;
  referralSource: string;
  referralName?: string;
  invitationStatus: SubmissionStatus;
  allowedNextStatuses?: SubmissionStatus[];
  invited_at?: string;
  approved_by?: string;
  approved_at?: string;
  createdAt: string;
}

const DEFAULT_WHATSAPP_INVITE_MESSAGE =
  "Hi {{name}}, welcome to Vibe From Cafe. Join our WhatsApp community here: {{group_link}}";

function resolveInviteConfig(env: Env) {
  return {
    groupInviteUrl: env.WHATSAPP_GROUP_INVITE_URL?.trim() ?? "",
    messageTemplate:
      env.WHATSAPP_INVITE_MESSAGE_TEMPLATE?.trim() || DEFAULT_WHATSAPP_INVITE_MESSAGE,
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: SubmissionBody;
  try {
    body = (await request.json()) as SubmissionBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, city, role, whatsapp, referralSource, referralName } = body;

  if (!name?.trim() || !city?.trim() || !role?.trim() || !whatsapp?.trim() || !referralSource?.trim()) {
    return Response.json({ error: "All required fields must be filled" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const submission: Submission = {
    id,
    name: name.trim(),
    city: city.trim(),
    role: role.trim(),
    whatsapp: whatsapp.trim(),
    referralSource: referralSource.trim(),
    ...((referralSource === "friend" || referralSource === "other") && referralName?.trim()
      ? { referralName: referralName.trim() }
      : {}),
    invitationStatus: "invited",
    invited_at: now,
    createdAt: now,
  };

  await env.VFC_SUBMISSIONS.put(`submission:${id}`, JSON.stringify(submission));

  return Response.json({
    success: true,
    submission: { id, invitationStatus: submission.invitationStatus },
    whatsappInvite: resolveInviteConfig(env),
  });
};
