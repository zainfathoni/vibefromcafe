interface AdminAuthEnv {
  ADMIN_SECRET?: string;
}

function hasCloudflareAccessJwt(request: Request) {
  const jwt = request.headers.get("cf-access-jwt-assertion");
  return typeof jwt === "string" && jwt.trim().length > 0;
}

export function requireAdmin(request: Request, env: AdminAuthEnv) {
  if (hasCloudflareAccessJwt(request)) {
    return null;
  }

  const configuredSecret = env.ADMIN_SECRET?.trim();
  if (configuredSecret) {
    const providedSecret = request.headers.get("x-admin-secret")?.trim();
    if (providedSecret && providedSecret === configuredSecret) {
      return null;
    }
  }

  return Response.json(
    {
      error:
        "Unauthorized: admin access requires Cloudflare Access JWT or valid X-Admin-Secret",
    },
    { status: 401 },
  );
}
