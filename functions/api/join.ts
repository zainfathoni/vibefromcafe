interface Env {
  VFC_SUBMISSIONS: KVNamespace;
}

interface SubmissionBody {
  name: string;
  city: string;
  role: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: SubmissionBody;
  try {
    body = await request.json<SubmissionBody>();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, city, role } = body;
  if (!name?.trim() || !city?.trim() || !role?.trim()) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const submission = {
    id,
    name: name.trim(),
    city: city.trim(),
    role: role.trim(),
    createdAt: new Date().toISOString(),
  };

  await env.VFC_SUBMISSIONS.put(`submission:${id}`, JSON.stringify(submission));

  return Response.json({ success: true });
};
