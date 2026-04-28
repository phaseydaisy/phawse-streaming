/**
 * Cloudflare Pages Worker
 * Handles dynamic routes for Next.js API and serves static files.
 */

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle API routes
    if (path.startsWith('/api/')) {
      // Forward API requests to the Worker
      const apiUrl = new URL(request.url);
      apiUrl.hostname = 'api.streaming.phawse.lol'; // Replace with your API Worker domain

      return fetch(apiUrl.toString(), request);
    }

    // Serve static assets
    try {
      return await env.ASSETS.fetch(request);
    } catch (err) {
      return new Response('Not Found', { status: 404 });
    }
  },
};