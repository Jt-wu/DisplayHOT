// Published dates on list pages: a date without a zone is read in the source's offset, whatever zone
// the server runs in (Docker runs in UTC; run this file with TZ=UTC and TZ=Asia/Shanghai to see both).
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseLooseDate, samsungNewsItems } from "@aihot/backend/sources/web-list";

const iso = (v: string, offset?: string) => parseLooseDate(v, offset)?.toISOString() ?? null;

test("E Ink dates preserve the day and source timezone", () => {
  assert.equal(iso("10\n 2026 . Sep"), "2026-09-09T16:00:00.000Z");
});

test("Samsung newsroom excludes video links and unconfirmed dates", () => {
  const items = samsungNewsItems([
    { num: "34529", post_type: "1", post_title: "OLED &#39;2K&#39;", post_date: "2026-09-16 09:30:00", date_view: "Y" },
    { num: "3", post_type: "2", post_title: "Video" },
    { num: "4", post_type: "1", post_title: "OLED", post_date: "2026-09-16", date_view: "N" },
  ], "https://news.samsungdisplay.com/category/67");
  assert.equal(items.length, 2);
  assert.equal(items[0]!.url, "https://news.samsungdisplay.com/34529");
  assert.equal(items[0]!.title, "OLED '2K'");
  assert.equal(items[0]!.publishedAt!.toISOString(), "2026-09-16T00:30:00.000Z");
  assert.equal(items[1]!.publishedAt, null);
});

test("a date and time without a zone is in the source's offset, not the server's", () => {
  assert.equal(iso("2026-09-26 10:00"), "2026-09-26T02:00:00.000Z");
  assert.equal(iso("2026-09-26T10:00:00"), "2026-09-26T02:00:00.000Z");
  assert.equal(iso("2026/09/26 10:00"), "2026-09-26T02:00:00.000Z");
  assert.equal(iso("2026年9月26日 10:00"), "2026-09-26T02:00:00.000Z");
  assert.equal(iso("2026-09-26 10:00", "-07:00"), "2026-09-26T17:00:00.000Z");
});

test("a bare date is midnight in the source's offset; an ISO date alone stays UTC midnight", () => {
  assert.equal(iso("2026/09/26"), "2026-09-25T16:00:00.000Z");
  assert.equal(iso("2026年9月26日"), "2026-09-25T16:00:00.000Z");
  assert.equal(iso("Sep 26, 2026"), "2026-09-25T16:00:00.000Z");
  assert.equal(iso("2026-09-26"), "2026-09-26T00:00:00.000Z");
  assert.equal(iso("September 26th, 2026", "+00:00"), "2026-09-26T00:00:00.000Z");
});

test("a date that carries its zone keeps it", () => {
  assert.equal(iso("2026-09-26T10:00:00Z"), "2026-09-26T10:00:00.000Z");
  assert.equal(iso("2026-09-26T10:00:00.000+09:00"), "2026-09-26T01:00:00.000Z");
  assert.equal(iso("Sat, 26 Sep 2026 10:00:00 GMT"), "2026-09-26T10:00:00.000Z");
  assert.equal(iso("Sat, 26 Sep 2026 10:00:00 +0200", "-07:00"), "2026-09-26T08:00:00.000Z");
});

test("no date at all is null", () => {
  assert.equal(iso(""), null);
  assert.equal(iso("yesterday"), null);
});
