import { isAdmin } from "@/lib/admin";
import { sessionsToCsv } from "@/lib/csv";
import { listSessions } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return new Response("Not allowed", { status: 401 });
  const csv = sessionsToCsv(await listSessions());
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="sous-sessions-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
