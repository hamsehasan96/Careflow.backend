import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register'];
  if (publicRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based access control
  const userRole = token.role as string;
  const adminRoutes = ['/admin-dashboard', '/staff', '/settings'];
  const supportWorkerRoutes = ['/support-dashboard', '/appointments'];
  const participantRoutes = ['/participant-dashboard'];

  if (
    (adminRoutes.includes(pathname) && userRole !== 'admin') ||
    (supportWorkerRoutes.includes(pathname) && userRole !== 'support_worker') ||
    (participantRoutes.includes(pathname) && userRole !== 'participant')
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/support-dashboard/:path*',
    '/participant-dashboard/:path*',
    '/appointments/:path*',
    '/staff/:path*',
    '/settings/:path*',
    '/auth/login',
    '/auth/register',
  ],
}; 