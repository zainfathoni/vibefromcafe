interface Env {
  DB: D1Database;
}

interface Settings {
  general_whatsapp_link: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const row = await env.DB
    .prepare("SELECT value FROM settings WHERE key = 'general_whatsapp_link'")
    .first<{ value: string }>();
  return Response.json({ general_whatsapp_link: row?.value ?? "" } satisfies Settings);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Partial<Settings>;
  try {
    body = (await request.json()) as Partial<Settings>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.general_whatsapp_link === "string") {
    await env.DB.prepare(`
      INSERT INTO settings (key, value) VALUES ('general_whatsapp_link', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).bind(body.general_whatsapp_link.trim()).run();
  }

  return Response.json({ success: true });
};
