---
name: knowledge-archive
description: 在 ai-for-exploration 仓库新建或更新探索档案，编写独立 Markdown 与交互 HTML、保留历史版本并同步网站索引。用于新建调研、深度探索及“更新某个档案”；仅修改网站 UI 时不发布研究版本。
---

# Knowledge Archive

维护可持续修订的知识档案。先读仓库 `AGENTS.md` 与 `site/catalog.json`，定位主题、当前双文件、日期及历史记录。

## 编写与讲解

- 新建或修订内容时读取 [authoring.md](references/authoring.md)，按问题选择材料和组织方式，不套固定学科章节。
- Markdown 用于细读、证据和取舍；HTML 独立安排讲解路径，两者使用同一批核验事实。不要用自动 Markdown 转换代替交互 HTML。
- HTML 使用仓库 [统一骨架](../../../templates/interactive/template.html)、[基础 CSS](../../../templates/interactive/base.css) 与 [模板指南](../../../templates/interactive/GUIDE.md)。保留自己的图示、控件与语义，不复制另一份共用页首和页尾。
- 最新双文件必须显示创建与内容更新日期。纯呈现维护保留内容日期，不生成研究历史版本。

## 更新已有档案

1. 阅读当前 `-latest.md/html`，核验受影响的新进展与旧判断。在 `work/` 沿已有内容完成新双草稿，保留有效分析，记录新增、修正、删除以及重新核验的范围。
2. 读取 [versioning.md](references/versioning.md)。固定原 `created`，确定本轮内容日期，检查历史引用资源；先完成草稿及相关验证，再替换 latest。
3. 对 HTML 草稿运行 `npm run sync:interactive -- --slug TOPIC --file work/DRAFT.html --updated YYYY-MM-DD`。同步共享样式、导航与日期，保留主题正文和脚本。
4. 使用 `scripts/update-archive.mjs` 发布两个已完成的草稿。它按旧 `updated` 保存旧双文件、更新 latest、catalog 和 README，遇到日期碰撞自动编号，失败时回滚。更换资源时用 `--assets` 传入新清单，保留 catalog 中旧清单供归档；不要提前手动移动旧 latest。
5. 构建、检查站点与受影响的交互。历史文件及其资源应进入发布产物且校验值不变；网站主入口来自 latest。失败恢复与重试见版本参考。

## 新建档案

创建独立目录，用 `<slug>-latest.md/html` 命名首次资料。登记 catalog，`created = updated =` 首次内容日期，`history = []`。使用模板同步 HTML，再运行 `npm run sync:index`、构建和检查。不要为空历史创建日期副本。

## 完成标准

核对双份资料的事实、日期、来源和变更范围；检查桌面、手机、核心交互、无 JS 阅读、打印和 Pages 项目子路径。只报告实际完成的验证与部署。持续更新由用户的下一次请求触发；本 skill 不创建定时任务或后台监控。
