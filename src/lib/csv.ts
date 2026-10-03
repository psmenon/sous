import type { SessionRow } from "./types";

export const CSV_COLUMNS = [
  "session_id", "created_at", "updated_at", "place", "stove", "equipment", "vessels", "servings",
  "dish", "recipe_source", "adapt_secs", "adapted_json", "stuck_count", "stuck_events",
  "reached_step_max", "outcome", "would_pay", "currency", "amount", "pays_today_for", "comment", "finished",
] as const;

function cell(v: unknown): string {
  if (v === undefined || v === null) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  // Neutralise spreadsheet formulas, then quote.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function sessionsToCsv(rows: SessionRow[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const r of rows) {
    const d = r.data;
    const stuck = (d.stuck_events ?? [])
      .map((e) => `[step ${e.step}] ${e.message || "(photo only)"}${e.had_photo ? " +photo" : ""} -> ${e.verdict}: ${e.answer} (${e.secs}s)`)
      .join(" | ");
    const values: Record<(typeof CSV_COLUMNS)[number], unknown> = {
      session_id: r.session_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
      place: d.place,
      stove: d.stove,
      equipment: (d.equipment ?? []).join("; "),
      vessels: d.vessels,
      servings: d.servings,
      dish: d.dish,
      recipe_source: d.recipe_source,
      adapt_secs: d.adapt_secs,
      adapted_json: d.adapted_json,
      stuck_count: (d.stuck_events ?? []).length,
      stuck_events: stuck,
      reached_step_max: d.reached_step_max,
      outcome: d.outcome,
      would_pay: d.would_pay,
      currency: d.currency,
      amount: d.amount,
      pays_today_for: d.pays_today_for,
      comment: d.comment,
      finished: d.finished ? "true" : "false",
    };
    lines.push(CSV_COLUMNS.map((c) => cell(values[c])).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}
