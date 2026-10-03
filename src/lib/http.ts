import "server-only";
import { NextResponse } from "next/server";

const MAX_BODY = 2 * 1024 * 1024;

// In-memory, per server instance. IPs live only in memory and are never stored.
const hits = new Map<string, number[]>();
const HOUR = 60 * 60 * 1000;

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "local").trim();
}

export function rateLimited(req: Request, bucket: string, perHour: number): boolean {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < HOUR);
  if (list.length >= perHour) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < HOUR)) hits.delete(k);
  }
  return false;
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BODY) return null;
  const text = await req.text();
  if (text.length > MAX_BODY) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

export const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
