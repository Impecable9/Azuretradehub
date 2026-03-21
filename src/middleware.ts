import { NextRequest, NextResponse } from "next/server";

// Middleware ultraligero — solo comprueba cookie de sesión sin importar Prisma
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/quotes") ||
    pathname.startsWith("/suppliers");

  const isLoginPage = pathname.startsWith("/login");

  // Comprueba cookie de sesión (NextAuth pone una de estas dos según HTTPS o no)
  const sessionToken =
    req.cookies.get("next-auth.session-token") ??
    req.cookies.get("__Secure-next-auth.session-token");

  const isLoggedIn = !!sessionToken;

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|rfq).*)"],
};
