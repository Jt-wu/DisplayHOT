import { createHmac } from "node:crypto";
import { credential } from "../config.ts";
import { sql } from "../db.ts";

let cleanupAfter = 0;
export function visitorKey(ip: string, agent: string, now = new Date()) {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(now);
  return createHmac("sha256", credential("auth", "SESSION_SECRET")!).update(`${day}\n${ip}\n${agent.slice(0, 300)}`).digest("hex");
}
export function trafficPath(raw: string) {
  const path = raw.split(/[?#]/)[0] ?? "/";
  return path.startsWith("/") && !path.startsWith("//") && !/^\/(admin|api)(\/|$)/i.test(path) && path.length <= 300 ? path : null;
}
export async function recordTraffic(event: { kind: "page" | "api"; path: string; visitor?: string; referrer?: string; device?: string; status?: number; ms?: number }) {
  await sql`INSERT INTO traffic_events (kind,path,visitor,referrer,device,status,ms) VALUES
    (${event.kind},${event.path},${event.visitor ?? null},${event.referrer ?? ""},${event.device ?? ""},${event.status ?? 200},${event.ms ?? 0})`;
  if (Date.now() > cleanupAfter) {
    cleanupAfter = Date.now() + 3600000;
    await sql`DELETE FROM traffic_events WHERE created_at < now() - interval '30 days'`;
  }
}
export async function trafficOverview(days: number) {
  const since = new Date(Date.now() - days * 86400000);
  const [summary, daily, pages, referrers, devices, apis] = await Promise.all([
    sql`SELECT count(*) FILTER (WHERE kind='page')::int AS views,
      count(DISTINCT visitor) FILTER (WHERE kind='page' AND created_at >= date_trunc('day',now() AT TIME ZONE 'Asia/Taipei') AT TIME ZONE 'Asia/Taipei')::int AS visitors_today,
      count(DISTINCT visitor) FILTER (WHERE kind='page' AND created_at > now()-interval '5 minutes')::int AS active,
      count(*) FILTER (WHERE kind='api')::int AS requests,
      count(*) FILTER (WHERE kind='api' AND status>=400)::int AS errors,
      coalesce(round(avg(ms) FILTER (WHERE kind='api')),0)::int AS latency FROM traffic_events WHERE created_at >= ${since}`,
    sql`SELECT to_char(created_at AT TIME ZONE 'Asia/Taipei','YYYY-MM-DD') AS day,count(*) FILTER (WHERE kind='page')::int AS views,
      count(DISTINCT visitor) FILTER (WHERE kind='page')::int AS visitors,count(*) FILTER (WHERE kind='api')::int AS requests FROM traffic_events WHERE created_at >= ${since} GROUP BY 1 ORDER BY 1`,
    sql`SELECT path AS label,count(*)::int AS count FROM traffic_events WHERE kind='page' AND created_at >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
    sql`SELECT coalesce(nullif(referrer,''),'直接访问 / 未提供') AS label,count(*)::int AS count FROM traffic_events WHERE kind='page' AND created_at >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    sql`SELECT device AS label,count(*)::int AS count FROM traffic_events WHERE kind='page' AND created_at >= ${since} GROUP BY 1 ORDER BY 2 DESC`,
    sql`SELECT path AS label,count(*)::int AS count,count(*) FILTER (WHERE status>=400)::int AS errors FROM traffic_events WHERE kind='api' AND created_at >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
  ]);
  return { days, summary: summary[0], daily, pages, referrers, devices, apis };
}
