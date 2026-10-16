const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/linktreeisdead";
export default {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // /f/<id> style public routes live under the same basePath.
  poweredByHeader: false,
  // The dev badge sits on top of the editor's Settings button (bottom-left).
  devIndicators: false,
  // PostHog reverse proxy (/ingest → us.i.posthog.com) so ad blockers don't drop analytics.
  skipTrailingSlashRedirect: true,
  async rewrites() { return [{ source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" }, { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" }]; },
};
