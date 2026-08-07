import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths
  const publicPaths = [
    '/login',
    '/api/auth/telegram',
    '/api/auth/demo',
  ];
  
  const isPublicPath = publicPaths.some(p => path.startsWith(p));
  const isApiPath = path.startsWith('/api');
  
  // Check for auth token
  const token = request.cookies.get('auth_token')?.value;
  
  // Redirect to login if not authenticated
  if (!token && !isPublicPath && !isApiPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect to home if already logged in and on login page
  if (token && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};