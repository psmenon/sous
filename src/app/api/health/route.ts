import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Deployment check. Says whether each setting is present, never its value.
export function GET() {
  return NextResponse.json({
    ok: true,
    api_key_set: !!process.env.ANTHROPIC_API_KEY,
    database_set: !!process.env.DATABASE_URL,
    admin_set: !!process.env.ADMIN_PASSWORD,
  });
}
