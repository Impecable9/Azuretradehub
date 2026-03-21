import { NextRequest, NextResponse } from "next/server";

// NextAuth v5 usa cookies con prefijo "authjs." no "next-auth."
// El auth real lo hace el layout del dashboard con auth() + redirect()
// El proxy solo corrige el nombre correcto de las cookies
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/quotes") ||
    pathname.startsWith("/suppliers");

  // NextAuth v5 cookie names
  const sessionToken =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionToken;

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|rfq).*)"],
};
