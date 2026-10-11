// Import private WeRSS feed snapshots through DisplayHOT's normal material pipeline.
import { readFileSync } from "node:fs";
import { sql, closeDb } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { sanitizeBody } from "@aihot/backend/content/sanitize";
import { stripTags } from "@aihot/backend/lib/text";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { queueProcessing } from "@aihot/backend/jobs/content";

interface FeedSnapshot {
  sourceId: string;
  error?: string;
  code?: string;
  items: Array<{ title: string; url: string; publishedAt: string | null; bodyHtml: string }>;
}
const snapshots: FeedSnapshot[] = JSON.parse(readFileSync(process.argv[2]!, "utf8"));
try {
  for (const feed of snapshots) {
    const [source] = await sql`SELECT id, enabled, kind, cursor FROM sources WHERE id = ${feed.sourceId}`;
    if (!source) throw new Error(`Unknown source: ${feed.sourceId}`);
    if (!source.enabled && (feed.error || !process.argv.includes("--activate"))) continue;
    if (feed.error) {
      const error = `WeRSS: ${feed.error}${feed.code ? ` (${feed.code})` : ""}`;
      await sql`INSERT INTO fetch_runs (source_id, finished_at, status, error)
        VALUES (${feed.sourceId}, now(), 'failed', ${error})`;
      await sql`UPDATE sources SET last_fetch_at = now(), health = 'failing',
        fail_count = fail_count + 1, last_error = ${error} WHERE id = ${feed.sourceId}`;
      console.log(JSON.stringify({ sourceId: feed.sourceId, error }));
      process.exitCode = 1;
      continue;
    }
    const activate = process.argv.includes("--activate") && source.kind === "mp_account" && !source.enabled;
    if (!activate && (!source.enabled || source.kind !== "external")) throw new Error(`Source is paused: ${feed.sourceId}`);
    // Validate the full snapshot before writing any material from this feed.
    const items = feed.items.map((item) => {
      const url = new URL(item.url);
      const publishedAt = item.publishedAt ? new Date(item.publishedAt) : null;
      const bodyHtml = sanitizeBody(item.bodyHtml, item.url);
      const bodyText = stripTags(bodyHtml);
      if (url.protocol !== "https:" || url.hostname !== "mp.weixin.qq.com" || !item.title.trim() ||
          (publishedAt !== null && !Number.isFinite(publishedAt.getTime()))) {
        throw new Error(`Incomplete WeRSS article in ${feed.sourceId}`);
      }
      return { ...item, publishedAt, bodyHtml, bodyText };
    });
    if (activate) await sql`UPDATE sources SET kind = 'external', config = '{}'::jsonb, enabled = true,
      tags = ${["微信公众号", "用户指定清单", "WeRSS"]} WHERE id = ${feed.sourceId}`;
    let created = 0;
    const skippedShort = items.filter(item => item.bodyText.length < 280).length;
    const usable = items.length - skippedShort;
    const initial = !source.cursor?.werss?.initializedAt;
    for (const item of items.filter(item => item.bodyText.length >= 280)) {
      const result = await upsertMaterial({ ...item, sourceId: feed.sourceId, via: "import", bodyStatus: "ok",
        backfill: !item.publishedAt ? "unconfirmed-publish-date" : initial ? "werss-initial-import" : null, raw: { provider: "werss" } });
      created += Number(result.created);
      if (result.created || result.revised) await queueProcessing(result.articleId);
    }
    await sql`INSERT INTO fetch_runs (source_id, finished_at, status, found_count, new_count, error, detail)
      VALUES (${feed.sourceId}, now(), ${usable ? "ok" : "skipped"}, ${items.length}, ${created},
        ${usable ? null : "WeRSS: no usable body (empty or shorter than 280 characters)"},
        ${sql.json({ provider: "werss", skippedShort })})`;
    await sql`UPDATE sources SET last_fetch_at = now(), last_ok_at = CASE WHEN ${usable > 0} THEN now() ELSE last_ok_at END,
      health = ${usable ? "ok" : "degraded"}, fail_count = 0,
      last_error = ${usable ? null : "WeRSS: no usable body (empty or shorter than 280 characters)"},
      cursor = coalesce(cursor, '{}'::jsonb) || ${sql.json({ werss: { initializedAt: source.cursor?.werss?.initializedAt ?? new Date().toISOString() } })}
      WHERE id = ${feed.sourceId}`;
    console.log(JSON.stringify({ sourceId: feed.sourceId, received: items.length, skippedShort, created }));
  }
} finally {
  await stopBoss();
  await closeDb();
}
