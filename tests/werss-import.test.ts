import "./setup.ts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { sql, closeDb } from "@aihot/backend/db";

after(closeDb);
test("WeRSS failure and short bodies cannot report healthy collection or reactivate paused feeds", async () => {
  const ids = ["test-werss-failed", "test-werss-short", "test-werss-paused"];
  const dir = mkdtempSync(join(tmpdir(), "werss-test-"));
  try {
    for (const id of ids) await sql`INSERT INTO sources (id, name, kind, enabled, health, last_ok_at)
      VALUES (${id}, ${id}, 'external', ${!id.endsWith("paused")}, 'ok', '2026-01-01')`;
    const path = join(dir, "snapshot.json");
    writeFileSync(path, JSON.stringify([
      { sourceId: ids[0], error: "WereadMPAPIError", code: "invalid_content", items: [] },
      { sourceId: ids[1], items: [{ title: "Short", url: "https://mp.weixin.qq.com/s/test", publishedAt: null, bodyHtml: "<p>Too short</p>" }] },
      { sourceId: ids[2], error: "WereadMPAPIError", items: [] },
    ]));
    const result = spawnSync(process.execPath, ["scripts/import-werss.ts", path], { env: process.env, encoding: "utf8", timeout: 30000 });
    assert.equal(result.status, 1, result.stderr);
    const rows = await sql`SELECT id, health, enabled, last_ok_at FROM sources WHERE id = ANY(${ids}) ORDER BY id`;
    assert.equal(rows[0]!.health, "failing");
    assert.equal(rows[1]!.enabled, false);
    assert.equal(rows[2]!.health, "degraded");
    assert.ok(rows.every(row => new Date(row.last_ok_at).getUTCFullYear() === 2026 && new Date(row.last_ok_at).getUTCMonth() === 0));
    const runs = await sql`SELECT status, found_count, new_count FROM fetch_runs WHERE source_id = ANY(${ids}) ORDER BY source_id`;
    assert.deepEqual(runs.map(row => [row.status, row.found_count, row.new_count]), [["failed", 0, 0], ["skipped", 1, 0]]);
  } finally {
    await sql`DELETE FROM sources WHERE id = ANY(${ids})`;
    rmSync(dir, { recursive: true, force: true });
  }
});
