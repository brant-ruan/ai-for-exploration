# 独立交互 HTML 基础模板

本目录统一不同主题的页面外观与基础布局，不决定研究内容、章节顺序、图示类型或交互机制。共同页首与页面标题中的站点名称统一为“探索档案”；所有页面的页尾统一为“ai-for-exploration / 持续探索，保留来路”。独立 HTML 应根据读者的问题重新组织讲解；自动渲染的 Markdown 阅读页仍是另一种入口。

## 文件与同步边界

- `base.css`：共用色彩、字体、间距、页面布局与内容组件。追加在主题 CSS 之后，覆盖旧页面的通用布局。`--archive-*` 是共用 token；旧主题使用的 `--ink`、`--paper` 等 token 有兼容映射。
- `template.html`：用于新主题的空骨架。目录、hero 和正文容器是基础结构；占位文案须替换。未预设章节、数据或性能指标。
- `navigation.js`：读取静态目录锚点，随滚动更新 `.current` 与 `aria-current="location"`，并增强共同打印按钮。以 Agent Sandboxing 的目录样式为准，主题不另写一套目录追踪。
- `../shared/header.html` / `header.css`：首页、Markdown 阅读页、交互页和 404 的唯一页首模板与样式；以主站的品牌标志、字体、最大宽度、间距与响应式布局为准。交互页保留报告入口，主题 CSS 不另设页首风格。固定侧栏随共享页首高度变化。
- `../shared/theme.css` / `theme.js`：共同深浅色主题与页首切换按钮。未选择时跟随系统，手动选择跨页记忆，存储不可用时仍可切换。主题脚本在 head 中先于样式同步执行；无 JS 时通过媒体查询跟随系统，切换按钮保持隐藏；深色变量仅作用于屏幕，打印保留浅色。
- `../shared/footer.html` / `footer.css`：首页、Markdown 阅读页、交互页和 404 的唯一页尾模板与样式；由 `scripts/site-chrome.mjs` 渲染。交互页内联相同 CSS，保持离线可用。
- 主题 CSS：留在主题 HTML 中，负责特定图示、控件与状态。不把某个主题的 runtime tab、攻击推演或模型计算器提升为所有主题都必须有的组件。
- `scripts/sync-interactive.mjs`：由仓库负责同步共同 CSS、header/footer、统一 favicon 和档案元数据。favicon 取自 `site/assets/favicon.svg`，以 SVG data URI 内联进 HTML。作者应使用仓库提供的同步命令；不复制一套共同导航、另设 favicon 或在主题内硬编码站点路径。

同步后，共用 CSS、页首与页尾 CSS、目录脚本和统一 favicon 内联进 HTML，正文、交互与图标可直接用 `file://` 离线使用。档案导航和 Markdown 阅读页使用相对地址，需要完整的发布目录才能正常访问；源仓库不含生成后的首页与阅读页，不能据此保证导航可用。发布到 Pages 项目子路径时保留相对目录关系。将文件单独移出发布目录后，正文与交互仍应可用，档案链接可能失效。

## 标记约定

保留注入标记，每个区段恰好一对，开始标记必须先于结束标记：

```html
<!-- archive:icon:start -->
<!-- archive:icon:end -->
<!-- archive:theme-script:start -->
<!-- archive:theme-script:end -->
<!-- archive:style:start -->
<!-- archive:style:end -->
<!-- archive:header:start -->
<!-- archive:header:end -->
<!-- archive:footer:start -->
<!-- archive:footer:end -->
<!-- archive:navigation-script:start -->
<!-- archive:navigation-script:end -->
```

`icon` 区段位于 `head` 内，每页唯一，由同步脚本填充统一 SVG favicon，不另放其他图标链接；`style` 区段位于 `head` 内、主题 CSS 之后；`header` 区段位于 `body` 开头；`footer` 区段位于 `main` / `.layout` 之后、主题脚本之前。同步脚本拥有这些区段内的内容。不要把研究正文、主题脚本或主题 CSS 放入它们。`navigation-script` 位于主题脚本之后、`body` 结束之前，统一目录追踪不放进主题脚本。共同 header 注入跳到 `#content` 的链接，主题骨架不另放一份。历史页导航如指向当前报告，应明确显示“深度报告（最新）”，不能让读者把最新阅读页误认为历史版配套报告。

`theme-script` 位于 head 中、样式之前，防止已选深色页面先闪出浅色。共用样式依次为 `base.css`、`header.css`、`footer.css`、`theme.css`。主题 CSS 的表面、状态和 SVG 填色/线条使用 `--theme-*` 语义 token，并以原浅色值作为 fallback；文字继续使用 `--archive-*` 或兼容 token。不要将标题前景色同时用作深色代码背景，也不要整体反转图片或 SVG。

骨架的 `archive:meta` 区段放在 hero 中，创建与内容更新日期由 catalog 同步，页面只在这里显示一次。Markdown 正文开头不列日期、类型、读者身份、核验截止或配套格式；直接进入主题问题与结论。核验范围和证据限制放在近旁或文末来源说明。hero 不叠加 eyebrow、metadata pill 或通用阅读路线；保留一条底部边界，避免连续装饰横线。

## 布局与共用组件

标准结构是 `.layout > aside.sidebar + main`。`main` 保留唯一的 `id="content"`，供跳过导航链接使用。页面只有一个主题主标题。

| 组件 | 用途与约定 |
| --- | --- |
| `.site-header` / `.header-inner` | 所有页面的共同页首；内层桌面 88px、窄屏 73px 高（另有 1px 底边），最大宽度 1240px；独立于主题样式 |
| `.brand` / `.brand-mark` / `.site-nav` | 主站品牌标志、标题与导航；结构由共同模板提供，交互页另保留 `.archive-*` 适配类 |
| `.archive-footer` / `.archive-footer-inner` | 共同页尾；放在主题布局之后，不混入研究章节 |
| `.archive-meta` | 档案日期、修订或来源说明；不代表全部材料已重新核验 |
| `.sidebar` | 短主题标题、按阅读顺序编号的静态链接与可选打印按钮；桌面 sticky 起点避开共同 header，窄屏改为横向滚动目录；不列重复日期、读者或方法说明 |
| `.hero` / `.dek` | 主题标题、问题或核心结论；不放格式、读者身份与重复元信息 |
| `.section-head` / `.number` / `.lede` | 可选的章节标题组合；编号不是模板要求 |
| `.card` | 并列说明、案例或证据；不要为凑卡片数量拆散论证 |
| `.widget` / `.widget-title` | 交互区域及其标题；控制布局与交互状态留给主题 CSS/JS |
| `.figure` | SVG 或其他图示与说明容器；使用 `figcaption` 或近旁解释 |
| `.table-wrap` | 表格横向滚动容器；表格使用 `thead`、`th` 和明确列义 |
| `.grid2` / `.grid3` | 双列或三列组件；使用 `minmax(0,1fr)`，窄屏收为单列 |
| `.stack` / `.layer` | 顺序说明或分层对照；并不规定它们表示某种架构 |
| `.note` / `.note.green` / `.note.amber` | 说明、条件或结果提示；同时用文字解释，不能仅靠颜色区分 |
| `.code` / `.source` / `.pill` | 代码或概念式、来源提示、小型元信息 |

颜色优先使用共用 token。图示的语义色可以自定义，并配文字或图例。`.archive-*` 前缀保留给档案 chrome，主题控件使用自身明确的类名，避免覆盖共同页首和页尾。

## 独立组织内容

围绕问题选择材料与讲解路径；可以使用因果图、时间线、案例、对照、参数推演或逐步解释，也可以不使用交互。模板不规定任何章节标题，也不要求复用某个主题的内容密度。

关键事实的出处放在内容附近。注明日期、版本与证据范围，区分已实现机制、厂商声明、论文结果与自己的分析。示例和合成模型标明假设；不让视觉效果暗示未测量的排名、概率或性能。

## 交互、静态回退与无障碍

- 正文、主要图示、默认结果和示例解释写在静态 HTML 中。不要依赖 JavaScript 生成整份材料。
- JavaScript 只增强已存在的内容。无 JS 时，读者仍能完成核心阅读；主题作者自行提供控件对应的静态说明或 `noscript` 回退。
- 共用样式尊重 `[hidden]`。tab/panel 的切换及无 JS/打印时哪些 panel 要展开，由主题负责；需要展开时用主题专用选择器，不使用全局隐藏属性反转。
- 使用原生 `button`、`input`、`select`、`details`。label 关联控件，切换按钮维护 `aria-pressed`，tab 维护 `aria-selected` 与键盘行为；更新结果可以用适当的 `aria-live`。
- 所有 `id` 唯一，目录 href 与实际标题一致。锚点避开共同 sticky header；不要重新设置全页面的 scroll offset。
- SVG 提供可理解的名字或说明；复杂图示在窄屏保留可读字号并允许容器横向查看。主题 CSS 负责图示的大小与滚动提示，基础 CSS 不修改 SVG 坐标、文字、颜色或交互状态。
- 尊重减少动画的系统偏好，不以动画作为唯一解释手段。

## 离线、资源与打印

完整材料优先使用内联 CSS/JS/SVG，不依赖 CDN、远程字体、在线图表库或运行时请求。若使用本地资源，使用相对于主题 HTML 的路径，并在主题 catalog 的 `assets` 中声明发布资源。引用链接可以指向外部资料，但正文不应靠请求这些链接才能显示。

历史双文件及依赖保持不可变。图片、数据或其他资源变化时使用新的版本路径，例如 `assets/20261011/figure.svg`，由 catalog 登记对应版本与校验值；不要覆盖已有历史页仍在引用的资源。统一样式与图标仅同步到 latest 页面，历史页保留归档时的内联样式、当时的图标与内容。

基础打印样式隐藏共同导航和侧栏，保留正文及统一页尾来源链接；表格和代码适配纸张宽度。图示仅做打印尺寸归一化，不修改内部语义。主题作者仍要处理自己的控件、隐藏 panel、详情与结果，保证打印版的关键内容完整。不要把所有 `[hidden]` 元素全局展开，因为其中也可能包含无关状态或重复结果。

同步与修改后，按仓库约定构建、检查并预览。检查桌面与窄屏、目录定位、键盘与交互状态、无 JS 阅读、打印，以及直接文件打开和 Pages 项目子路径。共用模板变更应至少回看一个已有主题；保留其机制、图示和真实内容。
