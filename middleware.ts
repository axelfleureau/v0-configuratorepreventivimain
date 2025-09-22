import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if the request is for the admin area
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isLoginRoute = req.nextUrl.pathname === "/admin/login"

  // If not an admin route, continue
  if (!isAdminRoute) {
    return NextResponse.next()
  }

  // For login page, no need to check auth
  if (isLoginRoute) {
    return NextResponse.next()
  }

  // For other admin routes, check for demo auth cookie
  const hasDemoAuth = req.cookies.get("demo_auth")

  // If no auth cookie, redirect to login
  if (!hasDemoAuth) {
    const redirectUrl = new URL("/admin/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
