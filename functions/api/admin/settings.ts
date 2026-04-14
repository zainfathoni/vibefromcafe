interface Env {
  VFC_SUBMISSIONS: KVNamespace;
}

interface Settings {
  general_whatsapp_link: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const general_whatsapp_link = await env.VFC_SUBMISSIONS.get("general_whatsapp_link");
  return Response.json({ general_whatsapp_link: general_whatsapp_link ?? "" } satisfies Settings);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: Partial<Settings>;
  try { body = (await request.json()) as Partial<Settings>; } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.general_whatsapp_link === "string") {
    await env.VFC_SUBMISSIONS.put("general_whatsapp_link", body.general_whatsapp_link.trim());
  }

  return Response.json({ success: true });
};
