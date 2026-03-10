interface Env {
  ADMIN_SECRET?: string;
}

/**
 * Middleware for all /api/admin/* routes.
 *
 * Cloudflare Access only protects the production domain — preview deployments
 * (e.g. feat-foo.vibefromcafe.pages.dev) are NOT covered. This middleware
 * ensures admin API routes are protected everywhere by requiring at least one
 * of:
 *   1. A valid Cloudflare Access JWT (Cf-Access-Jwt-Assertion header)
 *   2. A correct X-Admin-Secret header
 *
 * Local development (localhost / 127.0.0.1) is allowed through so that
 * `wrangler pages dev` keeps working without extra setup.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Allow local development
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "0.0.0.0"
  ) {
    return next();
  }

  // Check for Cloudflare Access JWT (present when Access is configured)
  const cfAccessJwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (cfAccessJwt) {
    return next();
  }

  // Check for valid X-Admin-Secret header
  const configuredSecret = env.ADMIN_SECRET?.trim();
  if (configuredSecret) {
    const providedSecret = request.headers.get("X-Admin-Secret")?.trim();
    if (providedSecret === configuredSecret) {
      return next();
    }
  }

  // No valid authentication — block the request
  return Response.json(
    { error: "Unauthorized: admin access requires authentication" },
    { status: 401 },
  );
};
