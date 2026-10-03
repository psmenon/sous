import { NextResponse } from "next/server";
import { readJson } from "@/lib/http";
import { isSessionId, patchSession, safely } from "@/lib/store";
import type { SessionData } from "@/lib/types";
import { cleanProfile } from "@/lib/validate";

export const runtime = "nodejs";

const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
  allowed.includes(v as T) ? (v as T) : undefined;
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body || !isSessionId(body.session_id)) return NextResponse.json({ ok: false }, { status: 400 });
  const p = (body.patch ?? {}) as Record<string, unknown>;
  const patch: SessionData = {};

  if (p.profile) {
    const prof = cleanProfile(p.profile);
    if (prof) Object.assign(patch, prof);
  }
  if (typeof p.reached_step_max === "number") patch.reached_step_max = Math.max(0, Math.min(10, Math.round(p.reached_step_max)));
  if ("outcome" in p) patch.outcome = pick(p.outcome, ["better", "same", "worse", "notyet"] as const);
  if ("would_pay" in p) patch.would_pay = pick(p.would_pay, ["yes", "maybe", "no"] as const);
  if ("currency" in p) patch.currency = text(p.currency, 10);
  if ("amount" in p) {
    const n = Number(p.amount);
    patch.amount = p.amount === null || p.amount === "" || !Number.isFinite(n) || n < 0 ? null : n;
  }
  if ("pays_today_for" in p) patch.pays_today_for = text(p.pays_today_for, 300);
  if ("comment" in p) patch.comment = text(p.comment, 2000);
  if (p.finished === true) patch.finished = true;

  for (const k of Object.keys(patch) as (keyof SessionData)[]) if (patch[k] === undefined) delete patch[k];
  await safely(() => patchSession(body.session_id as string, patch));
  return NextResponse.json({ ok: true });
}
