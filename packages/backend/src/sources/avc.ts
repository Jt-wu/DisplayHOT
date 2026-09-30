// AVC's public list omits bodies and original URLs. Resolve its public detail metadata before
// mapping: outer articles link to the original publisher, inner articles carry their own HTML.
import { guardedFetch } from "../lib/http-fetch.ts";
import { FetchError, type SourceRow } from "./types.ts";

export async function avcPublicItems(items: unknown[], source: SourceRow): Promise<Record<string, unknown>[]> {
  const keywords: string[] = source.config.ingestNoiseFilter?.keepIfMatches ?? [];
  const rows = items.filter((item): item is Record<string, unknown> => {
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    return /^\d+$/.test(String(row.id)) && typeof row.title === "string" && row.infoType !== "job" && row.infoType !== "custom"
      && (!keywords.length || keywords.some((word) => String(row.title).toLowerCase().includes(word.toLowerCase())));
  }).slice(0, 20);
  const out: Record<string, unknown>[] = [];
  for (const row of rows) {
    const url = new URL("/applet/user/avc-information/info/content", source.config.url);
    url.searchParams.set("id", String(row.id));
    const response = await guardedFetch(url.toString(), { timeoutMs: 20_000 });
    if (response.status !== 200) throw new FetchError(`AVC detail HTTP ${response.status}`, response.status);
    const result = JSON.parse(response.text());
    if (result.code !== 200 || !result.data) throw new FetchError("AVC public detail unavailable");
    const detail = result.data;
    const original = detail.type === "outer" && /^https?:\/\//i.test(detail.content ?? "") ? detail.content : null;
    out.push({
      ...row,
      articleUrl: original ?? `https://www.avc-mr.com/article/detail?id=${encodeURIComponent(String(row.id))}`,
      content: detail.type === "inner" && typeof detail.content === "string" ? detail.content : null,
    });
  }
  return out;
}
