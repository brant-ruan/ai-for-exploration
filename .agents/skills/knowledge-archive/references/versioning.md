# 双文件版本与发布

## 日期语义与命名

`created` 为首次内容日期，保持不变；`updated` 为本轮内容日期。首次两者相同。日期使用 `YYYY-MM-DD`，按用户所在时区确定；归档以 metadata 为准，不从 mtime 或 Git 时间推断。

初次资料：

```text
investigation-agent-sandboxing/
  investigation-agent-sandboxing-latest.md
  investigation-agent-sandboxing-latest.html
```

假设旧 `updated = 2026-10-11`，后来在 `2026-10-13` 更新：

```text
investigation-agent-sandboxing/
  investigation-agent-sandboxing-20261011.md
  investigation-agent-sandboxing-20261011.html
  investigation-agent-sandboxing-latest.md
  investigation-agent-sandboxing-latest.html
```

不是把旧版命名为 `20261013`。同一旧日期的第二对归档使用 `20261011-2`，之后 `-3`，不覆盖已有文件。网站的 HTML 主入口为 `-latest.html`，`report/` 稳定阅读地址始终渲染 `-latest.md`；历史菜单连接相应日期文件。

纯呈现改动及首次命名迁移不发布研究版本，不改变 `updated`。历史版本保留发表时的共用样式，不自动随新模板重排。

## 元数据

catalog 中每个主题保留最新两个日期、最新配对路径、资源列表与 `history`。历史条目如下：

```json
{
  "version": "20261011",
  "date": "2026-10-11",
  "markdown": "investigation-agent-sandboxing-20261011.md",
  "html": "investigation-agent-sandboxing-20261011.html",
  "summary": "替换这个版本时，新一轮资料新增、修正、删除与重查的说明。",
  "sha256": { "markdown": "实际 SHA-256", "html": "实际 SHA-256" },
  "assets": [],
  "assetsSha256": {}
}
```

`date` 是旧版内容日期；`summary` 是**替换说明**，不是旧版自己的摘要。资源校验 map 以主题目录内相对文件路径为键。

## 发布已完成草稿

先在 `work/` 写好两份新的完整资料，在旧内容上删改。两份都需更新，创建日期不变，内容更新日期与本轮 `--date` 一致。同步 HTML 草稿中的共用样式及日期：

```sh
npm run sync:interactive -- --slug investigation-agent-sandboxing --file work/revision.html --updated 2026-10-13
```

完成内容、引用与交互验证后发布：

```sh
npm run archive:update -- --slug investigation-agent-sandboxing --date 2026-10-13 --markdown work/revision.md --html work/revision.html --summary "本轮实际新增、修正、删除及重新核验的范围"
```

不要提前手动移动旧 latest。脚本检查两个非空草稿均已变化、日期未倒退、摘要、已有历史 hash 和 README 标记，再保存旧双文件、替换 latest、更新 catalog 与 README。它不检索资料、不检查研究事实，也不自动推送。正文里的日期、来源与范围由作者核对。

接着运行 `npm run build`、`npm run check`，预览受影响的页面。构建发布原样 latest 与历史双文件；整个通过检查的 Pages artifact 一起上线。部署失败时重试同一完成版本，不再次归档。

## 资源不可变

优先内联 CSS/JS/SVG。外部本地资源用不可变新路径，如 `assets/20261013/diagram.svg`；同日再次改图可用 `assets/20261013-2/`。保留历史条目引用的旧路径与字节。

旧内容中的配套文件、图表与数据应绑定其版本；不能把 `-latest` 链接当作历史配套资料。共同导航可以明确标注“最新”。外部引用优先固定 tag、commit 或论文版本；保留链接不代表冻结了对方网页。

更新工具不会改动或搬移资源。先准备新路径，再用 JSON 数组文件列出新版需要的资源，例如 `work/revision-assets.json` 内容为 `["assets/20261013/"]`。在上述发布命令追加 `--assets work/revision-assets.json`；空数组表示新版无需额外资源。不传此参数则沿用旧清单。

不要在发布前改 catalog 的旧 `assets`。脚本将旧清单及校验值存入历史，同时为 latest 登记新清单及校验值。遇到历史资源 hash 不一致时修复被误改的资源后继续，不清空校验记录来绕过错误。

## 失败恢复

更新脚本使用仓库锁、暂存备份与事务记录。它提供失败回滚，不能把多个本地文件替换称为操作系统层面的原子事务。落盘前会重新核对原文件，保护同时发生的其他修改。

普通失败恢复原文件并清理本轮归档；回滚遇到第三方编辑时不覆盖该编辑。回滚冲突或恢复失败时，保留 `work/` 中的事务记录、原始备份及锁，并报告冲突文件和材料位置。检查 manifest 和当前文件状态，协调恢复本轮文件后再清理锁；不要盲目删恢复目录或运行 `git reset --hard`。中断后先恢复一致状态，再重新发布，避免重复归档。
