import { applyEventInput, parseEventInput } from "../../../../app/data/event-validation";
import { getEventById, removeEvent, saveEvent } from "../../../../app/data/events-store";

interface Env {
  VFC_SUBMISSIONS: KVNamespace;
}

function getEventId(request: Request, params?: Record<string, string | string[] | undefined>) {
  const paramId = params?.id;
  if (typeof paramId === "string" && paramId.trim()) {
    return paramId.trim();
  }

  const match = new URL(request.url).pathname.match(/\/api\/admin\/events\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]).trim() : "";
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = getEventId(request, params);
  if (!id) {
    return Response.json({ error: "Event id is required" }, { status: 400 });
  }

  const event = await getEventById(env, id);
  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  return Response.json({ event });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = getEventId(request, params);
  if (!id) {
    return Response.json({ error: "Event id is required" }, { status: 400 });
  }

  const current = await getEventById(env, id);
  if (!current) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseEventInput(body, false);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const updated = applyEventInput(current, parsed.input);
  await saveEvent(env, updated);

  return Response.json({ event: updated });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = getEventId(request, params);
  if (!id) {
    return Response.json({ error: "Event id is required" }, { status: 400 });
  }

  const removed = await removeEvent(env, id);
  if (!removed) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  return Response.json({ success: true });
};
