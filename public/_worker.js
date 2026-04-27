/**
 * Cloudflare Pages Worker for Next.js API Routes
 * 
 * This handles API routes while the static site is served from Cloudflare Pages.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only handle API routes
    if (!url.pathname.startsWith('/api/')) {
      // For non-API routes, return the static content
      return fetch(request);
    }

    // Handle /api/auth/session - return empty session (user not authenticated)
    if (url.pathname === '/api/auth/session') {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Handle /api/auth/csrf - return CSRF token
    if (url.pathname === '/api/auth/csrf') {
      return new Response(JSON.stringify({ csrfToken: '' }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Handle /api/auth/signin - redirect to Clerk sign-in
    if (url.pathname === '/api/auth/signin' || url.pathname.startsWith('/api/auth/signin/')) {
      const clerkSignInUrl = `https://accounts.clerk.com/sign-in?redirect_url=${encodeURIComponent(url.origin)}`;
      return Response.redirect(clerkSignInUrl, 302);
    }

    // Handle /api/auth/signout - return success
    if (url.pathname === '/api/auth/signout') {
      return new Response(JSON.stringify({ url: '/api/auth/signout' }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Handle /api/auth/_log - return success for logging
    if (url.pathname === '/api/auth/_log') {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Handle /api/auth/providers - return available providers
    if (url.pathname === '/api/auth/providers') {
      return new Response(JSON.stringify({ clerk: { id: 'clerk', name: 'Clerk', type: 'oauth' } }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Handle /api/auth/_nextauth_data - return empty data
    if (url.pathname === '/api/auth/_nextauth_data') {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Handle /api/auth/[...nextauth] - return empty session
    if (url.pathname.includes('/api/auth/')) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Handle /search route
    if (url.pathname === '/search') {
      return new Response(JSON.stringify({ message: 'Search endpoint reached' }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Handle /anime/:id route
    if (url.pathname.startsWith('/anime/')) {
      const id = url.pathname.split('/anime/')[1];
      if (id) {
        return new Response(JSON.stringify({ message: `Anime ID: ${id}` }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Anime ID not provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};