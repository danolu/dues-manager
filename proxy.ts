import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "dues_session";

function getSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    return null;
  }

  return new TextEncoder().encode(value);
}

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = getSecret();

  if (!token || !secret) {
    return false;
  }

  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];
  const protectedPaths = ["/dashboard", "/settings", "/users", "/reports", "/payments", "/verify-email"];

  const authenticated = await isAuthenticated(request);

  if (authPages.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
