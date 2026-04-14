interface Env {
  VFC_SUBMISSIONS: KVNamespace;
}

export interface City {
  id: string;
  name: string;
  whatsapp_link: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  const [citiesRaw, generalWaLink] = await Promise.all([
    env.VFC_SUBMISSIONS.get("cities"),
    env.VFC_SUBMISSIONS.get("general_whatsapp_link"),
  ]);

  let cities: City[] = [];
  if (citiesRaw) {
    try {
      cities = JSON.parse(citiesRaw) as City[];
    } catch {
      // Return empty array if data is malformed
    }
  }

  return Response.json({
    cities,
    general_whatsapp_link: generalWaLink ?? "",
  });
};
