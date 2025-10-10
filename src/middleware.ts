// Enterprise Multi-Tenant Authentication Middleware
// Bergizi-ID SaaS Platform - Security & Access Control

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/features',
  '/pricing',
  '/blog',
  '/case-studies',
  '/demo-request',
  '/terms',
  '/privacy',
  '/contact'
]

// Authentication routes
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
]

// Platform admin routes
const adminRoutes = [
  '/admin'
]

// SPPG operational routes
const sppgRoutes = [
  '/dashboard',
  '/menu',
  '/procurement',
  '/production',
  '/distribution',
  '/inventory',
  '/hrd',
  '/reports',
  '/settings'
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route))
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route))
}

function isSppgRoute(pathname: string): boolean {
  return sppgRoutes.some(route => pathname.startsWith(route))
}

function isPlatformAdmin(userRole: string): boolean {
  return [
    'PLATFORM_SUPERADMIN',
    'PLATFORM_SUPPORT', 
    'PLATFORM_ANALYST'
  ].includes(userRole)
}

function isSppgUser(userRole: string): boolean {
  return userRole?.startsWith('SPPG_') || userRole === 'DEMO_USER'
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Handle authentication routes
  if (isAuthRoute(pathname)) {
    if (session) {
      // Redirect authenticated users based on role
      const redirectUrl = isPlatformAdmin(session.user.userRole) 
        ? '/admin' 
        : '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }
    return NextResponse.next()
  }

  // Require authentication for protected routes
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin route access
  if (isAdminRoute(pathname)) {
    if (!isPlatformAdmin(session.user.userRole)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Check SPPG route access
  if (isSppgRoute(pathname)) {
    // Must have SPPG ID
    if (!session.user.sppgId) {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }

    // Must be SPPG user
    if (!isSppgUser(session.user.userRole)) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // Check demo account expiry (would need additional validation)
    if (session.user.isDemoAccount) {
      // TODO: Add demo expiry check from database
    }

    return NextResponse.next()
  }

  // Default: allow access
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)' 
  ]
}