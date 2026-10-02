# 微信公众号免费采集

WeRSS 使用用户扫码登录的微信读书会话采集，无需 Dajiala API。2026-10-02 已匹配 27 个公众号，24 个返回文章并启用；首批导入 21 篇正文，3 篇过短内容过滤。网页展示摘要和原文链接，经原有模型筛选和归组。

每天北京时间 07:00、19:00 运行，随机延迟五分钟内，按原文 URL 去重。当前接口只提供每个账号最新一篇，不能补齐历史，也可能漏掉两次采集间的文章。登录失效需重新扫码。日期从原文 publish_time 校验，无法确认时留空并标记历史资料。

今日芯闻、DISCIEN迪显、芯八哥未返回可用文章，保持暂停。中国机器人图鉴、学不会吃亏的经济学原理、华为相关、MIT Technology Review 尚缺唯一对应身份；产业洞察条目暂未接入。清单尚未全部完成。

## 部署

服务目录 `/opt/displayhot-werss`。WeRSS 容器 `displayhot-werss`，API 容器 `aihot-api-1`，网络 `aihot_default`。管理端只监听 `127.0.0.1:8001`，通过 SSH 转发访问。私有 `.env`、data 和扫码会话不得提交。

复制脚本：`scripts/import-werss.ts`、`scripts/werss/import-snapshots.py`、`scripts/werss/run.sh` 到服务目录同名文件；`scripts/werss/snapshot.py` 复制为 `snapshot-werss.py`。`industry/wechat-feeds.json` 复制到 `data/enabled-feeds.json`。systemd service/timer 复制到 `/etc/systemd/system`。

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now displayhot-werss.timer
sudo systemctl start displayhot-werss.service
sudo systemctl list-timers displayhot-werss.timer
sudo journalctl -u displayhot-werss.service --since today
```

首次验证可用后手动使用 `python3 /opt/displayhot-werss/import-snapshots.py --activate`。定时运行没有此参数，管理员暂停的信源不会自动启用。失败记录 `data/snapshot-failures.json`，导入结果 `import-results.json`。

当前适配 WeRSS 镜像 `ghcr.io/rachelos/we-mp-rss:latest`，部署镜像 ID `af771f21b3f7958a5dea16911fba050a6d7b92eac2fb2499c467c1b11f07ef34`。升级需验证接口兼容性。会话失效时不反复请求或轮换账号规避限制。
