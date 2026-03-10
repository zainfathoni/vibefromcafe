interface AdminAuthEnv {
  ADMIN_SECRET?: string;
}

export function requireAdmin(request: Request, env: AdminAuthEnv) {
  const configuredSecret = env.ADMIN_SECRET?.trim();
  if (configuredSecret) {
    const providedSecret = request.headers.get("x-admin-secret")?.trim();
    if (providedSecret && providedSecret === configuredSecret) {
      return null;
    }
  }

  return Response.json(
    {
      error: "Unauthorized: admin access requires valid X-Admin-Secret",
    },
    { status: 401 },
  );
}
