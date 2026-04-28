/**
 * Cloudflare Pages Worker
 * 
 * Simply serves static assets. API routes are handled by api-worker.
 */

export default {
  async fetch(request, env, ctx) {
    // Just serve static assets - let Cloudflare Pages handle the routing
    return env.ASSETS.fetch(request);
  }
};