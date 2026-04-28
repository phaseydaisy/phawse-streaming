export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Serve static assets directly
    if (path.startsWith('/_next/static/') || path.includes('.')) {
      return env.ASSETS.fetch(request);
    }

    // Handle dynamic routes - serve index.html for client-side routing
    if (
      path.startsWith('/anime/') ||
      path === '/search' ||
      path === '/favorites' ||
      path === '/profile'
    ) {
      const indexUrl = new URL('/index.html', request.url);
      return env.ASSETS.fetch(indexUrl.toString());
    }

    // Default: serve the file or fallback to index.html
    return env.ASSETS.fetch(request);
  },
};