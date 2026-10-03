import type { Metadata } from "next";
import { adminEnabled, isAdmin } from "@/lib/admin";
import { listSessions } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sous admin", robots: { index: false, follow: false } };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

export default async function Admin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  if (!adminEnabled()) {
    return (
      <main className="wrap admin">
        <h1 className="h2">Admin</h1>
        <p className="muted">Set ADMIN_PASSWORD on the server to turn on this page.</p>
      </main>
    );
  }
  if (!(await isAdmin())) {
    return (
      <main className="wrap admin">
        <h1 className="h2">Team sign in</h1>
        <form className="card stack" method="post" action="/api/admin/login">
          <label className="field">
            <span className="label">Password</span>
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          {e ? <p className="err" role="alert">That password did not work.</p> : null}
          <button className="btn primary" type="submit">Open</button>
        </form>
      </main>
    );
  }

  const rows = await listSessions();
  return (
    <main className="wrap admin admin-wide">
      <div className="admin-head">
        <h1 className="h2">Sessions ({rows.length})</h1>
        <div className="row">
          <a className="btn primary" href="/api/admin/csv">Download CSV</a>
          <form method="post" action="/api/admin/login">
            <button className="btn ghost" name="logout" value="1">Sign out</button>
          </form>
        </div>
      </div>
      <div className="table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Time</th><th>Place</th><th>Stove</th><th>Dish</th><th>Steps reached</th>
              <th>Stuck questions</th><th>Outcome</th><th>Would pay</th><th>Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = r.data;
              const total = d.adapted_json?.steps.length;
              return (
                <tr key={r.session_id}>
                  <td>{fmt(r.created_at)}</td>
                  <td>{d.place ?? ""}</td>
                  <td>{d.stove ?? ""}</td>
                  <td>{d.dish ?? ""}</td>
                  <td>{d.reached_step_max ? `${d.reached_step_max}${total ? ` of ${total}` : ""}` : ""}</td>
                  <td>
                    {(d.stuck_events ?? []).length ? (
                      <details>
                        <summary>{d.stuck_events!.length}</summary>
                        <ul>
                          {d.stuck_events!.map((s, i) => (
                            <li key={i}>
                              Step {s.step}: {s.message || "(photo only)"} {s.had_photo ? "(photo)" : ""} → {s.verdict}, {s.secs}s
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : "0"}
                  </td>
                  <td>{d.outcome ?? ""}</td>
                  <td>{d.would_pay ?? ""}</td>
                  <td>{d.amount != null ? `${d.amount} ${d.currency ?? ""}` : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
