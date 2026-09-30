import "./setup.ts";
import assert from "node:assert/strict";
import http from "node:http";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { config } from "@aihot/backend/config";
import { fetchJsonList } from "@aihot/backend/sources/json-list";
import { unsupportedConfig } from "@aihot/backend/sources/config-keys";
import { ENTITIES } from "@aihot/industry/taxonomy";

const pack = JSON.parse(readFileSync(new URL("../industry/sources.json", import.meta.url), "utf8"));
test("display source pack has valid owners, supported config, and no fulltext syndication", () => {
  assert.equal(new Set(pack.sources.map((s: any) => s.id)).size, pack.sources.length);
  for (const source of pack.sources) {
    assert.deepEqual(unsupportedConfig(source.kind, source.config), [], source.id);
    if (source.owner_entity_id) assert.ok(ENTITIES[source.owner_entity_id], source.id);
    assert.equal(source.site_fulltext, false);
    assert.equal(source.syndicate_fulltext, false);
  }
});

test("AVC resolves public original links and inner bodies, filters unrelated articles, and preserves Beijing dates", async () => {
  const details: string[] = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url!, "http://localhost");
    let data: unknown;
    if (url.pathname.endsWith("/info/list")) data = [
      { id: "1", title: "OLED面板价格月报", author: "奥维睿沃", createTime: "2026-09-29 16:12:27", type: "outer", infoType: "info" },
      { id: "2", title: "显示器出货量研究", createTime: "2026-09-28 12:00:00", type: "inner", infoType: "info" },
      { id: "3", title: "空调市场研究", createTime: "2026-09-27 12:00:00", infoType: "info" },
      { id: "4", title: "OLED行业招聘", infoType: "job" },
    ];
    else {
      const id = url.searchParams.get("id")!;
      details.push(id);
      data = id === "1" ? { type: "outer", content: "https://mp.weixin.qq.com/s/display-research" }
        : { type: "inner", content: "<p>显示器出货量同比增长5%，统计期间为2026年上半年。</p>" };
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 200, data }));
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const previous = config.allowPrivateNetworkFetch;
  config.allowPrivateNetworkFetch = true;
  try {
    const port = (server.address() as { port: number }).port;
    const source = structuredClone(pack.sources.find((s: any) => s.id === "json-avc-display"));
    source.config.url = `http://127.0.0.1:${port}/applet/user/avc-information/info/list`;
    const items = await fetchJsonList(source);
    assert.deepEqual(details, ["1", "2"]);
    assert.equal(items.length, 2);
    assert.equal(items[0]!.url, "https://mp.weixin.qq.com/s/display-research");
    assert.equal(items[0]!.publishedAt!.toISOString(), "2026-09-29T08:12:27.000Z");
    assert.equal(items[0]!.bodyStatus, "pending", "a public redirect is no article body");
    assert.equal(items[1]!.bodyStatus, "ok");
    assert.match(items[1]!.bodyText!, /同比增长5%/);
    assert.equal(items[1]!.url, "https://www.avc-mr.com/article/detail?id=2");
  } finally {
    config.allowPrivateNetworkFetch = previous;
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
