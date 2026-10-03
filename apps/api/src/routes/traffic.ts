import type { FastifyInstance } from "fastify";
import { config } from "@aihot/backend/config";
import { recordTraffic, trafficOverview, trafficPath, visitorKey } from "@aihot/backend/admin/traffic";
import { adminHandler } from "./admin-auth.ts";

export function registerTraffic(app: FastifyInstance) {
  const recent = new Map<string, number>();
  app.post("/api/site/traffic", { bodyLimit: 1024 }, async (req, reply) => {
    reply.header("Cache-Control", "no-store");
    if (req.headers.origin !== new URL(config.siteUrl).origin) return reply.code(403).send();
    const body = req.body as { path?: unknown; referrer?: unknown } | null;
    const path = trafficPath(String(body?.path ?? ""));
    if (!path) return reply.code(400).send();
    const agent = String(req.headers["user-agent"] ?? "");
    if (/bot|crawler|spider|headless/i.test(agent)) return reply.code(204).send();
    const visitor = visitorKey(req.ip, agent);
    if ((recent.get(visitor) ?? 0) > Date.now() - 1000) return reply.code(429).send();
    if (recent.size > 10000) recent.clear();
    recent.set(visitor, Date.now());
    let referrer = "";
    try { referrer = new URL(String(body?.referrer ?? "")).hostname.slice(0, 200); } catch { /* Direct visit. */ }
    const device = /tablet|ipad/i.test(agent) ? "平板" : /mobile|android|iphone/i.test(agent) ? "手机" : "电脑";
    await recordTraffic({ kind: "page", path, visitor, referrer, device });
    return reply.code(204).send();
  });
  app.get("/api/admin/traffic", adminHandler(async (req) => {
    const value = Number((req.query as { days?: string }).days ?? 7);
    return trafficOverview([1,7,30].includes(value) ? value : 7);
  }));
  app.addHook("onResponse", (req, reply, done) => {
    const path = req.url.split("?")[0]!;
    if (path.startsWith("/api/v1/") || path === "/api/mcp" || path.endsWith(".xml")) {
      void recordTraffic({ kind: "api", path: path.slice(0,300), status: reply.statusCode, ms: Math.round(reply.elapsedTime) }).catch(() => req.log.warn("traffic recording failed"));
    }
    done();
  });
}
