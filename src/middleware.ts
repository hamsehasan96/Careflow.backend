import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
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
  const userRole = token.role;
  const adminRoutes = ['/dashboard/staff', '/dashboard/clients'];
  const supportRoutes = ['/dashboard/support'];
  const participantRoutes = ['/dashboard/participant'];

  if (userRole === 'admin') {
    // Admin can access all routes
    return NextResponse.next();
  }

  if (userRole === 'support_worker') {
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard/support', request.url));
    }
    return NextResponse.next();
  }

  if (userRole === 'participant') {
    if (adminRoutes.some(route => pathname.startsWith(route)) || 
        supportRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard/participant', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
  ],
}; 