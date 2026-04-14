interface Env {
  DB: D1Database;
}

interface City {
  id: string;
  name: string;
  whatsapp_link: string;
}

interface SubmissionBody {
  name?: string;
  city_id?: string;
  role?: string;
  role_other?: string;
  company?: string;
  is_freelancer?: boolean;
  whatsapp?: string;
  motivations?: string[];
  referral?: string;
  timestamp?: string;
  // Honeypot — bots fill this, humans don't see it
  website?: string;
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
  // city is always set (city name) for backwards compat with admin UI
  city: string;
  city_id?: string;
  name: string;
  role: string;
  role_other?: string;
  company?: string;
  is_freelancer?: boolean;
  whatsapp: string;
  motivations?: string[];
  referral?: string;
  // Legacy fields kept for submissions created before the new form
  referralSource?: string;
  referralName?: string;
  invitationStatus: SubmissionStatus;
  allowedNextStatuses?: SubmissionStatus[];
  invited_by?: string;
  invited_at?: string;
  approved_by?: string;
  approved_at?: string;
  createdAt: string;
}

const OTHER_CITY_ID = "__other__";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: SubmissionBody;
  try {
    body = (await request.json()) as SubmissionBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot check — return fake success to confuse bots
  if (body.website) {
    const row = await env.DB
      .prepare("SELECT value FROM settings WHERE key = 'general_whatsapp_link'")
      .first<{ value: string }>();
    return Response.json({ success: true, whatsapp_link: row?.value ?? "" });
  }

  const { name, city_id, role, role_other, company, is_freelancer, whatsapp, motivations, referral } = body;

  if (!name?.trim() || !city_id?.trim() || !role?.trim() || !company?.trim() || !whatsapp?.trim() || !referral?.trim()) {
    return Response.json({ error: "All required fields must be filled" }, { status: 400 });
  }

  if (!motivations?.length) {
    return Response.json({ error: "Please select at least one motivation" }, { status: 400 });
  }

  // Resolve city name and destination WhatsApp link from D1
  let cityName = "";
  let whatsappLink = "";

  if (city_id === OTHER_CITY_ID) {
    cityName = "Other";
    const row = await env.DB
      .prepare("SELECT value FROM settings WHERE key = 'general_whatsapp_link'")
      .first<{ value: string }>();
    whatsappLink = row?.value ?? "";
  } else {
    const city = await env.DB
      .prepare("SELECT id, name, whatsapp_link FROM cities WHERE id = ?")
      .bind(city_id.trim())
      .first<City>();
    if (!city) {
      return Response.json({ error: "Invalid city" }, { status: 400 });
    }
    cityName = city.name;
    whatsappLink = city.whatsapp_link;
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? null;
  const roleOther = role === "Other" && role_other?.trim() ? role_other.trim() : null;

  await env.DB.prepare(`
    INSERT INTO submissions
      (id, name, city, city_id, role, role_other, company, is_freelancer, whatsapp, motivations, referral, invitation_status, ip, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?)
  `).bind(
    id,
    name.trim(),
    cityName,
    city_id.trim(),
    role.trim(),
    roleOther,
    company.trim(),
    is_freelancer ? 1 : 0,
    whatsapp.trim(),
    JSON.stringify(motivations.filter(Boolean)),
    referral.trim(),
    ip,
    now,
  ).run();

  return Response.json({ success: true, whatsapp_link: whatsappLink });
};
