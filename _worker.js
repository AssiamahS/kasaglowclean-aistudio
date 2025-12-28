// Cloudflare Pages routing override
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route /api/* → Functions
    if (url.pathname.startsWith("/api/")) {
      return env.__STATIC_CONTENT
        ? env.ASSETS.fetch(request)
        : fetch(request);
    }

    // All other paths → Serve SPA
    return env.ASSETS.fetch(request);
  },
};
