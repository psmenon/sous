import "server-only";
import { promises as fs } from "fs";
import path from "path";
import postgres from "postgres";
import type { SessionData, SessionRow, StuckEvent } from "./types";

// Postgres when DATABASE_URL is set (Neon, Supabase, any Postgres).
// Otherwise a JSON file in .data/ so the app runs locally with no setup.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isSessionId = (s: unknown): s is string => typeof s === "string" && UUID.test(s);

let sql: postgres.Sql | null = null;
let ready: Promise<void> | null = null;

function db() {
  if (!process.env.DATABASE_URL) return null;
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL, { max: 3, idle_timeout: 20, prepare: false });
    ready = sql`
      create table if not exists sessions (
        session_id uuid primary key,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        data jsonb not null default '{}'::jsonb
      )`.then(() => undefined);
  }
  return sql;
}

const FILE = path.join(process.cwd(), ".data", "sessions.json");
let fileLock: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<Record<string, SessionRow>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function updateFile(id: string, fn: (d: SessionData) => SessionData) {
  const run = fileLock.then(async () => {
    const all = await readFile();
    const now = new Date().toISOString();
    const row = all[id] ?? { session_id: id, created_at: now, updated_at: now, data: {} };
    row.data = fn(row.data);
    row.updated_at = now;
    all[id] = row;
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  });
  fileLock = run.catch(() => undefined);
  return run;
}

export async function patchSession(id: string, patch: SessionData) {
  const s = db();
  if (s) {
    await ready;
    await s`
      insert into sessions (session_id, data) values (${id}, ${s.json(patch as postgres.JSONValue)})
      on conflict (session_id) do update
        set data = sessions.data || excluded.data, updated_at = now()`;
    return;
  }
  await updateFile(id, (d) => ({ ...d, ...patch }));
}

export async function addStuckEvent(id: string, ev: StuckEvent) {
  const s = db();
  if (s) {
    await ready;
    const arr = s.json([ev] as unknown as postgres.JSONValue);
    await s`
      insert into sessions (session_id, data) values (${id}, jsonb_build_object('stuck_events', ${arr}::jsonb))
      on conflict (session_id) do update
        set data = jsonb_set(sessions.data, '{stuck_events}',
                   coalesce(sessions.data->'stuck_events', '[]'::jsonb) || ${arr}::jsonb),
            updated_at = now()`;
    return;
  }
  await updateFile(id, (d) => ({ ...d, stuck_events: [...(d.stuck_events ?? []), ev] }));
}

export async function listSessions(): Promise<SessionRow[]> {
  const s = db();
  if (s) {
    await ready;
    const rows = await s<SessionRow[]>`
      select session_id, created_at, updated_at, data from sessions order by created_at desc limit 5000`;
    return rows.map((r) => ({
      ...r,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at).toISOString(),
    }));
  }
  const all = Object.values(await readFile());
  return all.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Logging must never block the cook.
export async function safely(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e) {
    console.error("[sous] log failed:", (e as Error).message);
  }
}
