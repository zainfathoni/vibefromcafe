interface Env {
  VFC_SUBMISSIONS: KVNamespace;
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
  invited_by?: string;
  invited_at?: string;
  approved_by?: string;
  approved_at?: string;
  createdAt: string;
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
  const submission: Submission = {
    id,
    name: name.trim(),
    city: city.trim(),
    role: role.trim(),
    whatsapp: whatsapp.trim(),
    referralSource: referralSource.trim(),
    ...(referralSource === "friend" && referralName?.trim()
      ? { referralName: referralName.trim() }
      : {}),
    invitationStatus: "signed_up",
    createdAt: new Date().toISOString(),
  };

  await env.VFC_SUBMISSIONS.put(`submission:${id}`, JSON.stringify(submission));

  return Response.json({ success: true });
};
