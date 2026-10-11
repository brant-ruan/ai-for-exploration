# AI for Exploration

记录使用人工智能辅助知识管理与探索的尝试：广度调研一个领域，或深入追问一个具体问题。

**网站：[知识探索档案](https://brant-ruan.github.io/ai-for-exploration/)**

## 主题

| 主题 | 日期 | 资料 |
| --- | --- | --- |
| [Agent Sandboxing](https://brant-ruan.github.io/ai-for-exploration/investigation-agent-sandboxing/report/)：从容器隔离到受控执行平台 | 2026-10-11 | [Markdown](investigation-agent-sandboxing/investigation-agent-sandboxing.md) · [交互讲解](https://brant-ruan.github.io/ai-for-exploration/investigation-agent-sandboxing/investigation-agent-sandboxing.html) |

广度调研通常保留两份独立资料：`.md` 详细记录机制、证据与来源；`.html` 通过图示、案例与交互重新组织讲解。网站同时提供原始交互 HTML 和渲染后的 Markdown 阅读页。

## 维护与预览

需要 Node.js 22 或更高版本：

```sh
npm ci
npm run build
npm run check
npm run preview
```

打开 `http://127.0.0.1:4173/ai-for-exploration/`。网站源文件位于 `site/`，主题信息集中在 [site/catalog.json](site/catalog.json)，构建产物 `dist/` 不提交。

新增主题时，创建独立目录、放入资料，在 `site/catalog.json` 登记路径与元数据，并更新本页主题表。`investigation-*` 用于广度调研；`exploration-*` 用于深度探索。详细协作约定见 [AGENTS.md](AGENTS.md)。

GitHub Pages 使用 [GitHub Actions 工作流](.github/workflows/pages.yml)：PR 构建检查，推送到 `main` 后自动发布。首次设置须在 **Settings → Pages → Source** 选择 **GitHub Actions**。
