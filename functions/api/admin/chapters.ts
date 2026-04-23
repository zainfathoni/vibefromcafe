interface Env {
  DB: D1Database;
}

interface City {
  id: string;
  name: string;
  whatsapp_link: string;
}

function isValidCity(c: unknown): c is City {
  if (typeof c !== "object" || c === null) return false;
  const city = c as Record<string, unknown>;
  return (
    typeof city.id === "string" && city.id.trim() !== "" &&
    typeof city.name === "string" && city.name.trim() !== "" &&
    (city.whatsapp_link === undefined || typeof city.whatsapp_link === "string")
  );
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB
    .prepare("SELECT id, name, whatsapp_link FROM cities ORDER BY name ASC")
    .all<City>();
  return Response.json({ cities: results });
};

// Accepts the full updated cities array — client owns the merge/delete logic.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return Response.json({ error: "Expected an array of cities" }, { status: 400 });
  }

  if (!body.every(isValidCity)) {
    return Response.json({ error: "Each city must have a non-empty id and name" }, { status: 400 });
  }

  const cities = body as City[];
  const ids = cities.map((c) => c.id.trim());
  if (new Set(ids).size !== ids.length) {
    return Response.json({ error: "City ids must be unique" }, { status: 400 });
  }

  // Replace all cities atomically
  await env.DB.batch([
    env.DB.prepare("DELETE FROM cities"),
    ...cities.map((c) =>
      env.DB.prepare("INSERT INTO cities (id, name, whatsapp_link) VALUES (?, ?, ?)")
        .bind(c.id.trim(), c.name.trim(), (c.whatsapp_link ?? "").trim())
    ),
  ]);

  return Response.json({ success: true, cities });
};
