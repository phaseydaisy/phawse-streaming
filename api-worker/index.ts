/**
 * Cloudflare Worker for Next.js API Routes
 * 
 * This worker handles API routes while the static site is served from Cloudflare Pages.
 * Uses Clerk for authentication - no database required!
 * 
 * Setup:
 * 1. Deploy this worker: npx wrangler deploy api-worker/index.ts
 * 2. Add a route in Cloudflare Dashboard: api.yourdomain.com/* -> this worker
 * 3. Configure Clerk environment variables in Cloudflare
 */

export interface Env {
  // Clerk environment variables - set in Cloudflare Dashboard
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Only handle API routes
    if (!url.pathname.startsWith('/api/')) {
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

    // Handle /api/auth routes - redirect to Clerk
    if (url.pathname.includes('/api/auth/')) {
      return handleAuth(request, env, url);
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

    // Handle /search route
    if (url.pathname === '/search') {
      return new Response(JSON.stringify({ message: 'Search endpoint reached' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function handleAuth(request: Request, env: Env, url: URL): Promise<Response> {
  // Redirect all auth requests to Clerk's hosted sign-in
  // Clerk handles sign-in, sign-up, OAuth, session management
  
  const clerkSignInUrl = `https://accounts.clerk.com/sign-in?redirect_url=${encodeURIComponent(url.origin)}`;
  
  // For API routes that need auth, return 401 with Clerk sign-in URL
  return new Response(JSON.stringify({
    error: "Authentication required",
    signInUrl: clerkSignInUrl,
    message: "Please sign in via Clerk"
  }), {
    status: 401,
    headers: { 
      'Content-Type': 'application/json',
      'Location': clerkSignInUrl
    }
  });
}