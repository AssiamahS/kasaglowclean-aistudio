export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // If it's an API call, let the Functions handle it
    if (url.pathname.startsWith('/api/') || url.pathname === '/submit-lead') {
      return env.ASSETS.fetch(request);
    }

    // Otherwise, try to serve a static asset
    const response = await env.ASSETS.fetch(request);
    
    // IF the asset is missing (404), serve index.html (This is the SPA magic)
    if (response.status === 404) {
      return env.ASSETS.fetch(new URL('/index.html', url.origin));
    }

    return response;
  }
};
