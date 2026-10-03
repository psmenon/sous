import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sous_admin";

function secret() {
  const pw = process.env.ADMIN_PASSWORD || "";
  return process.env.ADMIN_COOKIE_SECRET || createHmac("sha256", "sous-admin").update(pw).digest("hex");
}

export function adminEnabled() {
  return !!process.env.ADMIN_PASSWORD;
}

export function passwordOk(input: string) {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) return false;
  const a = Buffer.from(createHmac("sha256", "cmp").update(input).digest("hex"));
  const b = Buffer.from(createHmac("sha256", "cmp").update(pw).digest("hex"));
  return timingSafeEqual(a, b);
}

// Cookie value: "<expiry ms>.<hmac>"
export function makeToken() {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const sig = createHmac("sha256", secret()).update(String(exp)).digest("hex");
  return `${exp}.${sig}`;
}

export function tokenOk(token: string | undefined) {
  if (!adminEnabled() || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const want = createHmac("sha256", secret()).update(exp).digest("hex");
  return sig.length === want.length && timingSafeEqual(Buffer.from(sig), Buffer.from(want));
}

export async function isAdmin() {
  const jar = await cookies();
  return tokenOk(jar.get(ADMIN_COOKIE)?.value);
}
