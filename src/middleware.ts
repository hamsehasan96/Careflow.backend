import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register'];
  if (publicRoutes.includes(path)) {
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
  const userRole = request.cookies.get('userRole')?.value;
  if (path.startsWith('/dashboard/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (path.startsWith('/dashboard/support') && userRole !== 'support_worker') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (path.startsWith('/dashboard/participant') && userRole !== 'participant') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
  ],
}; 