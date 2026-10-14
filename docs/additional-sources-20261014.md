# 第二批显示信源（2026-10-14）

新增八个目录，沿用行业筛选、评分、去重和归组，公开出口仅摘要与原文链接。首次每个自动信源最多导入四篇，按原始日期归档。

| ID | 信源 | 采集方案与限制 |
| --- | --- | --- |
| web-cinno-display | CINNO Research | 官方光电显示分类 HTML，卡片标题与日期；北京时区。公开文章，排除付费 COMPASS。 |
| rss-ubi-display | UBIResearchNet | 官网明确提供的 RSS，过滤 Video / Focus Pro 分类，按发布日期排序。响应约 7.4 MB，当前在采集器 8 MiB 上限内；超过上限会明确失败，不能静默截断。 |
| web-auo-display | 友达光电 | 官方新闻 HTML，卡片标题与日期，排除 ESG、奖项、一般人事变动。 |
| web-udc-display | UDC | 官方博客新闻 HTML；投资者关系入口 403、RSS 500，使用可访问且提供技术与经营公告的官方博客入口。详情补全原始日期；排除会议电话和颁奖。 |
| web-lg-display | LG Display | 官方新闻 HTML，卡片日期和 contentId 详情。列表与文章路径相同，显式允许带 contentId 的 URL 前缀后识别为文章。韩国时区。 |
| web-thelec-display | The Elec | 显示面板专栏目录，暂停自动采集；站点声明限制未经授权复制、发布、修改及分发，保留“转载范围待确认”标签。媒体独家和匿名信源不能当成企业已确认事实。 |
| web-sid-display | SID / Display Week | 技术论文索引目录，暂停自动采集；当前新闻页正文以 PDF 与 DOI 链接为主，RSS 为空，尚未具备稳定可提取的正文入口。 |
| web-sigmaintell-display | 群智咨询 | 官方研究入口目录，暂停自动采集；服务器连接失败，页面选择器尚需在访问恢复后核实。 |

新增 HTML 规则只对显式带查询参数的 allowUrlPrefixes 放行同路径详情；默认仍拒绝同页锚点和查询导航，回归测试涵盖文章、分页、锚点。

配置初始间隔为 6 小时，现有自适应调度可能调整周期；SID 初始 24 小时但保持暂停。5 个自动信源须以生产 fetch_runs 与文章实际入库完成验证，HTTP 200 或目录创建不能代替可用性判断。
