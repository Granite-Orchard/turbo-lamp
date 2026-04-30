import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api",
  "/_not-found",
  "/onboarding/auth",
];

const protectedPaths = ["/dashboard", "/onboarding"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/"),
    )
  ) {
    return NextResponse.next();
  }

  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
