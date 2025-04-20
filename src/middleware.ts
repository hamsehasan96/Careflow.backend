import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// List of allowed origins for CORS
const allowedOrigins = [
  'https://careflow-frontend.vercel.app',
  'http://localhost:3000',
];

// Rate limiting configuration
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

// Protected routes and their allowed roles
const protectedRoutes = {
  '/dashboard/admin': ['admin'],
  '/dashboard/support': ['admin', 'support'],
  '/dashboard/participant': ['admin', 'support', 'participant'],
  '/dashboard': ['admin', 'support', 'participant'],
};

export async function middleware(request: NextRequest) {
  // CORS headers
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204 });
    }
  }

  // Rate limiting
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  const requests = rateLimit.get(ip) || [];
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'");

  // Authentication and role-based access check
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPublicRoute = request.nextUrl.pathname === '/';

  // Allow public routes and auth pages
  if (isPublicRoute || isAuthPage) {
    return response;
  }

  // Redirect to login if not authenticated
  if (!token && !isApiRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check role-based access for protected routes
  if (token && !isApiRoute) {
    const userRole = token.role;
    const currentPath = request.nextUrl.pathname;

    // Find the matching protected route
    const matchingRoute = Object.entries(protectedRoutes).find(([route]) => 
      currentPath.startsWith(route)
    );

    if (matchingRoute) {
      const [, allowedRoles] = matchingRoute;
      if (!allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        const redirectPath = userRole === 'admin' ? '/dashboard/admin' :
                           userRole === 'support' ? '/dashboard/support' :
                           userRole === 'participant' ? '/dashboard/participant' :
                           '/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  // Provider isolation for API routes
  if (isApiRoute && token) {
    const providerId = token.providerId;
    if (!providerId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Add providerId to request headers for backend processing
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-Provider-Id', providerId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 