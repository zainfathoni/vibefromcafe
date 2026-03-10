interface AdminAuthEnv {
  ADMIN_SECRET?: string;
}

export function requireAdmin(request: Request, env: AdminAuthEnv) {
  const configuredSecret = env.ADMIN_SECRET?.trim();

  // If no secret is configured, rely on Cloudflare Access (production)
  // or allow access for local development
  if (!configuredSecret) {
    return null;
  }

  // If the header is provided, it must match — reject wrong secrets
  const providedSecret = request.headers.get("x-admin-secret")?.trim();
  if (providedSecret) {
    if (providedSecret === configuredSecret) {
      return null;
    }
    return Response.json(
      { error: "Unauthorized: invalid X-Admin-Secret" },
      { status: 401 },
    );
  }

  // No header provided — allow through, relying on Cloudflare Access
  // as the primary auth layer for browser-based admin SPA requests
  return null;
}
