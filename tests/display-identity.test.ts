import assert from "node:assert/strict";
import { test } from "node:test";
import { enforceIdentity } from "@aihot/backend/editorial/writing";

test("Omdia's TCL China Star spelling supports the Chinese company name without admitting unnamed companies", () => {
  const input = { title: "OLED monitor panel shipments", text: "TCL China Star brings new competition with inkjet-printed OLED technology.", sourceKind: "rss" };
  const copy = enforceIdentity(input, { titleZh: "OLED显示器面板出货", summaryZh: "TCL华星带来喷墨打印OLED技术的新竞争。" });
  assert.equal(copy.identityGuard.outcome, "pass");
  assert.ok(copy.summaryZh);
  assert.equal(enforceIdentity(input, { titleZh: "OLED显示器面板出货", summaryZh: "京东方推出新技术。" }).summaryZh, "");
});
