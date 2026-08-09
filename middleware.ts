import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Coarse route -> allowed roles map. Refine per-page with server-side checks
// as needed (e.g. an instructor may only see their own learners).
const ROLE_RULES: { prefix: string; roles: Array<"ADMIN" | "INSTRUCTOR" | "STUDENT"> }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard", roles: ["ADMIN", "INSTRUCTOR"] },
  { prefix: "/live-session", roles: ["ADMIN", "INSTRUCTOR"] },
  { prefix: "/learners", roles: ["ADMIN", "INSTRUCTOR"] },
  { prefix: "/practice", roles: ["ADMIN", "INSTRUCTOR", "STUDENT"] },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const rule = ROLE_RULES.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  const role = req.auth?.user?.role;
  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!rule.roles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/live-session/:path*", "/learners/:path*", "/practice/:path*"],
};
