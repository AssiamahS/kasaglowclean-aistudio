export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route API requests to Functions runtime
    if (url.pathname.startsWith("/api/")) {
      return fetch(request);
    }

    // Everything else served from SPA
    return env.ASSETS.fetch(request);
  },
};
