import { getAllEvents } from "../../app/data/events-store";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const events = await getAllEvents(env);
  return Response.json({
    events: events.filter((event) => event.status === "published"),
  });
};
