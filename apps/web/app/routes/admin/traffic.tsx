import { useEffect } from "react";
import { Link, useRevalidator } from "react-router";
import { SITE } from "@aihot/industry/site";
import type { Route } from "./+types/traffic";
import { adminGet } from "../../lib/admin.server";
import { AdminPage, Card, Stat } from "../../features/admin/ui";

interface Traffic {
  days: number;
  summary: { views: number; visitors_today: number; active: number; requests: number; errors: number; latency: number };
  daily: Array<{ day: string; views: number; visitors: number; requests: number }>;
  pages: Rank[]; referrers: Rank[]; devices: Rank[]; apis: Rank[];
}
interface Rank { label: string; count: number; errors?: number }
export function loader({ request }: Route.LoaderArgs) {
  return adminGet<Traffic>(request, `/api/admin/traffic?days=${new URL(request.url).searchParams.get("days") ?? 7}`);
}
export const meta: Route.MetaFunction = () => [{ title: `访问流量 · ${SITE.name} 后台` }];
export const headers: Route.HeadersFunction = () => ({ "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
function Ranking({ title, rows }: { title: string; rows: Rank[] }) {
  return <Card title={title}>{rows.length ? <ul className="space-y-3">{rows.map(row => <li key={row.label} className="flex justify-between gap-4 text-sm"><span className="min-w-0 break-all text-ink-2">{row.label}</span><span className="num shrink-0">{row.count.toLocaleString()}{row.errors !== undefined ? ` · 错误 ${row.errors}` : ""}</span></li>)}</ul> : <p className="text-sm text-ink-3">尚无数据</p>}</Card>;
}
export default function TrafficPage({ loaderData: data }: Route.ComponentProps) {
  const revalidator = useRevalidator();
  useEffect(() => { const id = setInterval(() => { if (document.visibilityState === "visible") void revalidator.revalidate(); }, 60000); return () => clearInterval(id); }, [revalidator]);
  const max = Math.max(1, ...data.daily.map(row => row.views));
  return <AdminPage title="访问流量" subtitle="网站自身统计 · 每分钟刷新 · 北京时间 · 数据保留 30 天" actions={<div className="flex gap-3 text-sm">{[1,7,30].map(days => <Link key={days} to={`?days=${days}`} className={data.days === days ? "font-semibold text-accent" : "text-ink-3"}>{days === 1 ? "24 小时" : `${days} 天`}</Link>)}</div>}>
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Stat label="页面浏览量 PV" value={data.summary.views.toLocaleString()} hint="所选时间范围" />
      <Stat label="今日独立访客（估算）" value={data.summary.visitors_today.toLocaleString()} hint="每天轮换匿名标识，非登录用户数" />
      <Stat label="最近 5 分钟访客" value={data.summary.active.toLocaleString()} />
      <Stat label="公开 API / RSS 请求" value={data.summary.requests.toLocaleString()} />
      <Stat label="API / RSS 错误请求" value={data.summary.errors.toLocaleString()} hint="HTTP 4xx / 5xx" tone={data.summary.errors ? "warn" : "ok"} />
      <Stat label="API / RSS 平均响应" value={`${data.summary.latency} ms`} />
    </div>
    <Card title="每日访问趋势"><div className="space-y-3">{data.daily.length ? data.daily.map(row => <div key={row.day} className="grid grid-cols-[88px_1fr_110px] items-center gap-3 text-xs"><span className="num text-ink-3">{row.day}</span><div className="h-5 rounded bg-accent-soft"><div className="h-5 rounded bg-accent" style={{ width: `${100 * row.views / max}%` }} /></div><span className="num text-right">{row.views} PV · {row.visitors} UV</span></div>) : <p className="text-sm text-ink-3">统计上线后开始累计，目前尚无访问记录。</p>}</div></Card>
    <div className="mt-5 grid gap-5 lg:grid-cols-2"><Ranking title="热门页面" rows={data.pages} /><Ranking title="访问来源域名" rows={data.referrers} /><Ranking title="设备类型" rows={data.devices} /><Ranking title="公开 API / RSS 接口" rows={data.apis} /></div>
    <p className="mt-5 text-xs leading-6 text-ink-3">页面浏览由浏览器上报，排除后台及已识别爬虫；禁用 JavaScript、拦截统计或未完成加载的访问不会计入。来源为浏览器提供的外部域名。API / RSS 统计仅包含到达应用的请求，不含 Cloudflare 缓存命中或拦截流量。无历史回填，不保存原始 IP、查询参数或完整来源链接。</p>
  </AdminPage>;
}
