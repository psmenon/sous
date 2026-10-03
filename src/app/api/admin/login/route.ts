import { NextResponse } from "next/server";
import { ADMIN_COOKIE, makeToken, passwordOk } from "@/lib/admin";
import { rateLimited } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL("/admin", req.url);
  if (rateLimited(req, "admin-login", 20)) {
    url.searchParams.set("e", "1");
    return NextResponse.redirect(url, 303);
  }
  const form = await req.formData().catch(() => null);
  const pw = String(form?.get("password") ?? "");
  if (form?.get("logout")) {
    const res = NextResponse.redirect(url, 303);
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }
  if (!passwordOk(pw)) {
    url.searchParams.set("e", "1");
    return NextResponse.redirect(url, 303);
  }
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return res;
}
