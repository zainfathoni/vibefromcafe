interface Env {
  VFC_SUBMISSIONS: KVNamespace;
}

interface City {
  id: string;
  name: string;
  whatsapp_link: string;
}

async function readCities(env: Env): Promise<City[]> {
  const raw = await env.VFC_SUBMISSIONS.get("cities");
  if (!raw) return [];
  try { return JSON.parse(raw) as City[]; } catch { return []; }
}

function isValidCity(c: unknown): c is City {
  return (
    typeof c === "object" &&
    c !== null &&
    typeof (c as City).id === "string" &&
    (c as City).id.trim() !== "" &&
    typeof (c as City).name === "string" &&
    (c as City).name.trim() !== "" &&
    typeof (c as City).whatsapp_link === "string"
  );
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return Response.json({ cities: await readCities(context.env) });
};

// Accepts the full updated cities array — client owns the merge/delete logic.
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return Response.json({ error: "Expected an array of cities" }, { status: 400 });
  }

  if (!body.every(isValidCity)) {
    return Response.json({ error: "Each city must have a non-empty id and name" }, { status: 400 });
  }

  const cities = body as City[];
  await env.VFC_SUBMISSIONS.put("cities", JSON.stringify(cities));
  return Response.json({ success: true, cities });
};
