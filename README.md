# DisplayHOT · 显示产业情报

基于 [AIHOT 开源框架](https://github.com/KKKKhazix/AIHOT) 的显示行业信息库。采集公开信源，生成中文标题、摘要与推荐理由，归并同一事件，提供行业热点、日报、周报、月报、主题搜索、RSS、公开 API 和 MCP。

## 关注范围

- **市场与价格**：出货量、面积、价格、库存、市场份额、供需与稼动率。
- **面板与技术**：LCD、OLED、Mini LED、Micro LED、电子纸、材料、设备与制造工艺。
- **产业链与投资**：产能建设与退出、投资、并购、财报、合作与政策。
- **终端与应用**：电视、显示器、笔记本、手机、车载、商显与 AR/VR。
- **研究与观点**：论文、实测、技术解读、专业访谈和产业分析。

优先关注有明确数字、统计期间、证据与商业阶段的变化，过滤广告、招聘、活动邀请、无关家电和重复转载。机构预测与实际出货、样品与量产、同比与环比、面板与整机分别处理。

## 默认信源

| 信源 | 接入方式 | 说明 |
|---|---|---|
| [TrendForce 集邦咨询 · 显示面板](https://www.trendforce.cn/presscenter/news/Display) | 网页列表 | 公开研究新闻，解析原文链接及发布日期 |
| [TrendForce 集邦咨询 · LED](https://www.trendforce.cn/presscenter/news/LED) | 网页列表 | 经显示行业预筛过滤无关照明与能源信息 |
| [奥维云网 / 奥维睿沃](https://www.avc-mr.com/article) | 公开 JSON 接口与详情解析 | 过滤显示相关资讯，解析具体原文链接；官网内嵌正文可直接处理，外链正文以来源可访问性为准 |
| [OLED-Info](https://www.oled-info.com/) | RSS | OLED 专业行业媒体 |

全部信源默认只展示摘要与原文链接，不展示或转发全文。付费研究报告未接入。Omdia、DSCC、Counterpoint、UBI Research 已列入机构主题与实体词表，**尚未配置为自动采集信源**；可在后台添加经验证的公开列表或授权订阅接口。

## 启动

需要 Docker，以及一个 OpenAI 兼容模型 API Key。Node.js 直接运行需 24.11 或更新版本。

```bash
git clone https://github.com/Jt-wu/DisplayHOT.git
cd DisplayHOT
node scripts/init-env.ts --llm-key <你的模型APIKey>
docker compose up -d --build
```

网站：<http://localhost:3000>；后台：`/admin`；管理员密码保存在本机 `.env` 的 `ADMIN_PASSWORD`。公开部署时设置 `SITE_URL` 和域名，参考 [部署文档](docs/deploy.md)。不要提交 `.env`、密钥或 `.data/`。

开发和试界面时设置 `COLLECT_ENABLED=false`、`MODEL_CALLS_ENABLED=false`，保持推送和 IndexNow 关闭。开启采集与模型后才会产生精选、事件聚簇与日报；未配置模型时不会自动生成这些内容。

## 配置与验证

行业设置集中在 `industry/`：站名、五类分类、主题、信源、提示词与品牌。模型榜及 Codex 重置监控已关闭。内部包名 `@aihot/*` 保留，以便维护和合并上游更新。

[显示行业配置说明](docs/display-industry.md) 包含信源限制、精选校准、检查命令和上线事项。精选门槛暂保留上游值（T1 60、T1_5 65、T2 76），**尚未用显示行业人工样本校准**。使用规则与隐私页面仍为模板，上线前需按实际运营情况确认。

- [行业改造](docs/customize.md)
- [信源管理](docs/sources.md)
- [精选校准](docs/selection.md)
- [架构](docs/architecture.md)

## 许可

基于 AIHOT，保留原作者署名和 [MIT 许可证](LICENSE)，第三方资产说明见 [NOTICE](NOTICE)。DisplayHOT 使用独立站名及显示器图标，不使用 AIHOT 品牌标志。
