import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  // Dashboard routes - require authentication
  '/dashboard': ['child', 'mentor', 'admin'],
  '/my-stories': ['child', 'mentor', 'admin'],
  '/progress': ['child', 'mentor', 'admin'],
  '/create-stories': ['child'],
  '/profile': ['child', 'mentor', 'admin'],
  
  // Mentor routes - require mentor role
  '/mentor-dashboard': ['mentor', 'admin'],
  
  // Admin routes - require admin role
  '/admin': ['admin'],
  
  // API routes protection
  '/api/stories': ['child', 'mentor', 'admin'],
  '/api/user/profile': ['child', 'mentor', 'admin'],
  '/api/admin': ['admin'],
  '/api/mentor': ['mentor', 'admin'],
  '/api/export': ['child', 'mentor', 'admin'],
  '/api/realtime': ['child', 'mentor', 'admin'],
} as const;

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/explore-stories',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/unauthorized',
  '/api/auth',
  '/api/user/register',
  '/api/user/forgot-password',
  '/api/user/reset-password',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

function getRequiredRoles(pathname: string): string[] | null {
  // Check exact matches first
  if (protectedRoutes[pathname as keyof typeof protectedRoutes]) {
    return protectedRoutes[pathname as keyof typeof protectedRoutes];
  }
  
  // Check for route patterns
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route + '/') || pathname === route) {
      return roles;
    }
  }
  
  return null;
}

function hasRequiredRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com wss:",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export default withAuth(
  function middleware(req: NextRequest & { nextauth?: any }) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;
    
    console.log('Middleware executed for:', pathname);
    console.log('Token exists:', !!token);
    console.log('User role:', token?.role);
    
    // Create response
    let response = NextResponse.next();
    
    // Add security headers to all responses
    response = addSecurityHeaders(response);
    
    // Skip middleware for public routes
    if (isPublicRoute(pathname)) {
      return response;
    }
    
    // Check if route requires specific roles
    const requiredRoles = getRequiredRoles(pathname);
    
    if (requiredRoles) {
      // Route requires authentication
      if (!token) {
        console.log('No token found, redirecting to login');
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Check if user has required role
      if (!hasRequiredRole(token.role, requiredRoles)) {
        console.log(`User role ${token.role} not in required roles:`, requiredRoles);
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      
      // Check if user account is active
      if (!token.isActive) {
        console.log('User account is not active');
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
    
    // Add user info to response headers for debugging (remove in production)
    if (process.env.NODE_ENV === 'development' && token) {
      response.headers.set('X-User-Role', token.role || 'unknown');
      response.headers.set('X-User-ID', token.sub || 'unknown');
    }
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Always allow access to public routes
        if (isPublicRoute(pathname)) {
          return true;
        }
        
        // For protected routes, check if user has token
        if (!token) {
          return false;
        }
        
        // Check role-based access
        const requiredRoles = getRequiredRoles(pathname);
        if (requiredRoles && !hasRequiredRole(token.role as string, requiredRoles)) {
          return false;
        }
        
        // Check if account is active
        if (!token.isActive) {
          return false;
        }
        
        return true;
      },
    },
    pages: {
      signIn: '/login',
      error: '/unauthorized',
    },
  }
);

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)',
  ],
};