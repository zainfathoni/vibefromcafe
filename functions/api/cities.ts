interface Env {
  DB: D1Database;
}

export interface City {
  id: string;
  name: string;
  whatsapp_link: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const [citiesResult, settingRow] = await Promise.all([
    env.DB.prepare("SELECT id, name, whatsapp_link FROM cities ORDER BY name ASC").all<City>(),
    env.DB.prepare("SELECT value FROM settings WHERE key = 'general_whatsapp_link'").first<{ value: string }>(),
  ]);

  return Response.json({
    cities: citiesResult.results,
    general_whatsapp_link: settingRow?.value ?? "",
  });
};
