interface Env {
  VFC_SUBMISSIONS: KVNamespace;
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
  name: string;
  // city is always set (city name) for backwards compat with admin UI
  city: string;
  city_id?: string;
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
    const generalWaLink = (await env.VFC_SUBMISSIONS.get("general_whatsapp_link")) ?? "";
    return Response.json({ success: true, whatsapp_link: generalWaLink });
  }

  const { name, city_id, role, role_other, company, is_freelancer, whatsapp, motivations, referral } = body;

  if (!name?.trim() || !city_id?.trim() || !role?.trim() || !company?.trim() || !whatsapp?.trim() || !referral?.trim()) {
    return Response.json({ error: "All required fields must be filled" }, { status: 400 });
  }

  if (!motivations?.length) {
    return Response.json({ error: "Please select at least one motivation" }, { status: 400 });
  }

  // Resolve city name and destination WhatsApp link from KV
  let cityName = "";
  let whatsappLink = "";

  const citiesRaw = await env.VFC_SUBMISSIONS.get("cities");
  let cities: City[] = [];
  if (citiesRaw) {
    try {
      cities = JSON.parse(citiesRaw) as City[];
    } catch {
      // ignore parse errors
    }
  }

  if (city_id === OTHER_CITY_ID) {
    cityName = "Other";
    whatsappLink = (await env.VFC_SUBMISSIONS.get("general_whatsapp_link")) ?? "";
  } else {
    const city = cities.find((c) => c.id === city_id);
    if (!city) {
      return Response.json({ error: "Invalid city" }, { status: 400 });
    }
    cityName = city.name;
    whatsappLink = city.whatsapp_link;
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const submission: Submission = {
    id,
    name: name.trim(),
    city: cityName,
    city_id: city_id.trim(),
    role: role.trim(),
    ...(role === "Other" && role_other?.trim() ? { role_other: role_other.trim() } : {}),
    company: company.trim(),
    is_freelancer: Boolean(is_freelancer),
    whatsapp: whatsapp.trim(),
    motivations: motivations.filter(Boolean),
    referral: referral.trim(),
    invitationStatus: "signed_up",
    createdAt: now,
  };

  // Store the individual submission record
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "";
  await env.VFC_SUBMISSIONS.put(`submission:${id}`, JSON.stringify({ ...submission, ip }));

  // Append a lightweight entry to the all_submissions index
  const allSubmissionsRaw = await env.VFC_SUBMISSIONS.get("all_submissions");
  let allSubmissions: Array<{ id: string; city_id: string; timestamp: string }> = [];
  if (allSubmissionsRaw) {
    try {
      allSubmissions = JSON.parse(allSubmissionsRaw) as typeof allSubmissions;
    } catch {
      // Start fresh if the stored value is malformed
    }
  }
  allSubmissions.push({ id, city_id: city_id.trim(), timestamp: now });
  await env.VFC_SUBMISSIONS.put("all_submissions", JSON.stringify(allSubmissions));

  return Response.json({ success: true, whatsapp_link: whatsappLink });
};
