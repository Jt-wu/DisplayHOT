# 显示行业配置

## 编辑标准

分类为市场与价格、面板与技术、产业链与投资、终端与应用、研究与观点。主题包括面板厂商和研究机构、OLED/LCD/Mini LED/Micro LED、显示材料设备、面板价格供需、车载显示、IT 显示、电子纸与 AR/VR。

评分维持七种内容类型、五个独立维度和原有整数加权结构，改为显示行业事件。内容类型为 technology_release、product_launch、market_report、research_paper、industry_event、opinion_analysis、tutorial_explainer。权重合成分数与信源门槛分开，不根据稿件篇幅或机构名气自动加分。

看重市场数据、技术结果、产能和投资的具体变化。证据不足的营销、模糊预告、普通促销、招聘及活动邀请压低评分。发布阶段、同比环比、单位、币种、统计期间、面板与整机口径必须忠实于原文。

## 信源实现

`industry/sources.json` 在新库首次启动时导入四个信源；重复 seed 不覆盖后台设置。已有 AI 示范信源的数据库需要在后台停用旧信源，再运行 seed 添加显示信源，本次不自动删除历史数据。

TrendForce 中文显示面板与 LED 新闻采用 `.list-items .list-item`，标题链接为 `h3 a.title-link`，日期为 `h4`；路径限制避免把导航和分页收成文章。LED 的非显示内容仍经过行业预筛。

奥维官网是动态页面。`json_list` 的 `mode: avc_public` 使用官网公开的列表与详情接口：先按显示关键词过滤标题和排除招聘/定制条目，每次最多解析 20 条详情；`outer` 条目使用详情返回的原始文章链接，`inner` 条目使用公开 HTML 正文。详情失败使本次采集报错，避免把不完整结果当作成功。日期通过 `publishedAtUtcOffset: +08:00` 固定按北京时间读取，不依赖服务器时区。原文链接指向微信时，正文能否取得取决于微信访问情况；需要稳定公众号正文时，可配置授权公众号采集服务。

OLED-Info 使用公开 RSS。全部来源 `site_fulltext`、`syndicate_fulltext` 为 false；获取供内部理解的正文不等于授权公开转载。

机构主题里的 Omdia、DSCC、Counterpoint 和 UBI Research 是可归类的实体名录，不代表它们已自动采集。付费报告没有抓取或绕过访问控制。

## 精选校准

门槛保留 T1 60、T1_5 65、T2 76，不宣称已适用于显示行业。`industry/gold.example.jsonl` 为格式示例，不是校准结果。按 [精选文档](selection.md) 标注 100–200 条资料，通过 `scripts/eval-selection.ts` 评估查准率、查全率后再调节。

## 检查

```bash
npm ci
npm run typecheck
# 使用单独的空测试数据库，名字以 _test 或 _ci 结尾
DATABASE_URL=postgres://.../displayhot_test node scripts/migrate.ts
DATABASE_URL=postgres://.../displayhot_test npm test
npm run build -w @aihot/web
node --test apps/web/tests/*.test.ts
# 先运行 api、web，关闭真实采集、模型、推送和 IndexNow
node scripts/smoke.ts --base http://localhost:3000
node scripts/mcp-check.ts http://localhost:3000/api/mcp
```

后端模型流程测试只使用本地 HTTP 模拟服务，不使用真实模型；真实信源试抓独立进行。新增来源测试覆盖配置/实体引用、奥维内嵌正文与原文链接、无关与招聘过滤、北京时间转换。

## 上线配置

仓库配置完成不代表网站已部署。生产运行需要模型 API Key、数据库、管理员密码、域名与 HTTPS。`industry/pages/terms.md`、`privacy.md` 仍是上游模板，运营主体、联系方式、数据处理方式与条款需由运营者确认后上线。飞书推送及其他付费来源按需单独配置。
