# AI for Exploration

记录使用人工智能辅助知识管理与探索的尝试：广度调研一个领域，或深入追问一个具体问题。

**网站：[探索档案](https://exp.wohin.me/)**

## 主题

<!-- topics:start -->

| 主题 | 创建日期 | 更新日期 | 资料 |
| --- | --- | --- | --- |
| [Agent Sandboxing](https://exp.wohin.me/investigation-agent-sandboxing/report/)：从容器隔离到受控执行平台 | 2026-10-11 | 2026-10-11 | [Markdown](investigation-agent-sandboxing/investigation-agent-sandboxing-latest.md) · [交互讲解](https://exp.wohin.me/investigation-agent-sandboxing/investigation-agent-sandboxing-latest.html) |

<!-- topics:end -->

广度调研通常保留两份独立资料：`.md` 详细记录机制、证据与来源；`.html` 通过图示、案例与交互重新组织讲解。网站同时提供原始交互 HTML 和渲染后的 Markdown 阅读页。

## 维护与预览

需要 Node.js 22 或更高版本：

```sh
npm ci
npm run build
npm run check
npm run preview
```

打开 `http://127.0.0.1:4173/`。网站源文件位于 `site/`，主题信息集中在 [site/catalog.json](site/catalog.json)，构建产物 `dist/` 不提交。当前自定义域名为 `exp.wohin.me`，使用根路径；可用 `BASE_PATH=/ai-for-exploration` 构建、检查和预览项目子路径。

新增主题时创建独立目录，在 `site/catalog.json` 登记元数据，运行 `npm run sync:index` 更新主题表。`investigation-*` 用于广度调研；`exploration-*` 用于深度探索。交互页从 [统一模板](templates/interactive/template.html) 开始，运行 `npm run sync:interactive` 内联基础样式与导航。

当前资料统一使用 `<话题名>-latest.md/html`；内容更新后，旧版按旧内容更新日期存为 `<话题名>-YYYYMMDD.md/html`，新资料仍叫 `-latest`。同日多版追加 `-2`、`-3`。创建日期不变，更新日期仅随研究内容修订改变。

下次可以直接要求“更新某个档案”：本地 [knowledge-archive skill](.agents/skills/knowledge-archive/SKILL.md) 会在旧内容上完成新双资料、保留历史、同步索引并验证。详细约定见 [AGENTS.md](AGENTS.md)；版本工具不负责自动检索或改写内容。

GitHub Pages 使用 [GitHub Actions 工作流](.github/workflows/pages.yml)：PR 构建检查，推送到 `main` 后自动发布。首次设置须在 **Settings → Pages → Source** 选择 **GitHub Actions**。

[CNAME](CNAME) 记录自定义域名；Actions 部署还需在 Pages 设置中配置同一域名。DNS 的 `exp` CNAME 指向 `brant-ruan.github.io`。
