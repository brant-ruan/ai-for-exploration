# 大语言模型时代的网络安全创业公司与产品

## 1. 先建立一张有用的地图

这轮创业有两种不同的经济逻辑。**Security for AI** 是企业部署模型、copilot 和 agent 后出现新的资产、数据流与执行权限，需要新的控制点；**AI for Security** 是利用模型和 agent，把已有安全工作的调查、测试、验证、修复变成可执行工作流。两者会交叉，例如一个做 AI 红队的平台，本身也可能使用攻击 agent；分类应看它卖给客户的安全结果。

值得先记住五个判断：

1. **“AI 安全”已经超出 prompt filter。** 模型文件扫描、上线前评测、工具调用拦截、身份授权和数据访问治理分别处在不同位置。检测器判断“这段内容像不像攻击”，权限系统决定“即使 agent 被骗，它还能做什么”，两者的保证和采购方都不同。
2. **2024—2026 的并购显著改变了独立创业公司名单。** Protect AI、Lakera、Robust Intelligence、Prompt Security，以及 2026 年的 Enkrypt AI、Virtue AI、Astrix、Oasis，均应结合收购后的平台归属阅读。融资成功、被收购和产品具有可证明安全性是三件事。具体状态与依据见第 7 节。
3. **漏洞赛道的关键变化是反馈闭环。** LLM 生成测试思路只是起点；执行测试、获取程序或服务反馈、确认 PoC、去重并形成可修复证据，才会产生可采购的结果。XBOW、RunSybil、Escape 的切入点不同，不能用一张榜单比较。
4. **SOC 赛道更像数据和流程工程。** Dropzone、7AI、Prophet 等要处理连接器、证据链、工具调用和结案权限；Torq 则已有编排平台前史。若没有客户环境中的可靠遥测，推理能力很难补齐缺失事实。
5. **对研究者，值得追踪的增量在“行动与证据”。** 包括任务约束能否转成可执行权限、不同可信度信息如何进入决策、多 agent 委托如何审计、以及安全工作流怎样证明结论。行业名单可以帮助定位问题，但不能代替针对研究新颖性的文献检索。

### 1.1 什么算“新”

以 2022 年末大语言模型大众化为观察转折，不把年份作为硬性排除规则：

- **新创主体**：2023 年及以后创立、围绕新需求或新工作流构建，例如 Prompt Security、Noma、Dropzone、XBOW、RunSybil。
- **同期起步**：2022 年成立或开始商业化，动机可能来自更早的 AI/ML 安全，例如 Protect AI、HiddenLayer、Oasis。
- **前史与转型对照**：成立更早，但对理解今日产品很重要，例如 Robust Intelligence、Zenity、Astrix、Horizon3、Torq、Giskard、RealAI。明确标注，避免把过去十年的 ML 安全重新包装成 LLM 后新创。

这里主要覆盖企业侧 AI/agent 防护、AppSec/漏洞与 SOC。反欺诈、deepfake、内容溯源、终端检测、硬件安全和通用云安全还有大量创新，不在本轮主体中展开。成熟厂商的 copilot 和模型平台原生护栏作为竞争边界，而不混入创业公司数量。

### 1.2 七类产品：先按控制点，再按公司

| 类别 | 客户想买什么结果 | 常见技术路线 | 首要边界 | 代表阅读入口 |
| --- | --- | --- | --- | --- |
| A1 AI 资产、模型与供应链 | 知道在用什么模型、组件和依赖，减少危险工件进入生产 | 资产发现、模型格式/反序列化检查、依赖与姿态分析 | 扫描干净不代表 agent 行为安全 | Protect AI、HiddenLayer、Noma |
| A2 评测与 AI 红队 | 上线前找到应用或 agent 的可利用弱点，并回归测试 | 攻击生成、黑盒/白盒测试、数据集与策略评测 | 有限测试集合与适应性攻击之间有差距 | Mindgard、Giskard、Pillar、Enkrypt、Virtue |
| A3 运行时防护与 AI 使用治理 | 降低 prompt injection、敏感信息外流、违规输出和 shadow AI 风险 | 代理/SDK、分类器、规则、LLM judge、多模态检测 | 接入覆盖、上下文、误报、延迟；绕过接入点仍是问题 | Lakera、Lasso、Prompt Security、WitnessAI、Aim |
| A4 agent 行动、身份与权限 | 明确谁委托 agent、允许访问什么、哪些动作需要批准 | 轨迹策略、工具拦截、身份图、短时凭证、最小权限 | 安全性取决于完整中介和策略表达能力 | Invariant、Zenity、Astrix、Token、Oasis |
| B1 漏洞发现、攻击验证 | 输出能重现的漏洞或攻击路径 | agent 规划与工具执行、主动探测、反馈验证、攻击图 | 已知漏洞复现、盲测发现、实网渗透是不同任务 | XBOW、RunSybil、Escape、Horizon3 |
| B2 修复与漏洞管理 | 减少可利用暴露，交付可接受的补丁 | 聚合扫描、可达性/上下文排序、补丁生成、测试与 backport | 补丁通过现有测试未必修复根因或保持全部语义 | Aikido、AISLE、ZeroPath、Corgea |
| B3 SOC 调查、狩猎与响应 | 缩短告警到有证据结案的时间 | 多 agent 调查、SIEM/EDR/IAM 查询、编排、受控响应 | 连接器权限、证据完备性、误结案与响应副作用 | Dropzone、7AI、Prophet、Simbian、Radiant、Torq |

公司可以横跨多类。下文给的是主要切入点，不是它“只会做”这一类的断言。A2 的有害输出/价值对齐测试与网络安全有交集，但不能直接当作数据泄漏或越权攻击的证据。

## 2. 公司速查：团队、产品与公开规模

本轮主体样本为 **36 家**，包含 LLM 后新创、同期起步与前史对照；长亭及第 7 节的 CalypsoAI、Pangea 另作补充对照。下表按主要控制点归组，每家公司只列一次，其他类别见交互页。

“成长/种子/未知”是公开融资记录的粗标签，不是员工或收入统计；已收购是组织状态。公司起步与履历的来源放在资料链接，具体资本、机制和边界见第 3—5 节及卡片。

### A1 · AI 资产、模型与供应链

| 公司 | 起步与地理联系 | 团队路径 | 本次可核状态 |
| --- | --- | --- | --- |
| [Protect AI](investigation-ai-security-startups-latest.html#company-protect-ai) | 2022 创业；先做 AI/ML 供应链安全，随后扩展 LLM 与应用防护。 美国 Seattle；现属 Palo Alto Networks | 产业 · [资料](https://salesforceventures.com/perspectives/market-map-our-security-portfolio/) | 已收购 |
| [Noma Security](investigation-ai-security-startups-latest.html#company-noma-security) | 2023 创业；2024-10-31 出隐身，先从 AI 开发生命周期统一平台切入。 美国商业市场 / 以色列 Tel Aviv R&D | 产业 · [资料](https://ballisticventures.com/why-we-led-the-series-a-round-in-noma/) | 独立 · 成长 |
| [HiddenLayer](investigation-ai-security-startups-latest.html#company-hiddenlayer) | 2022 公开起步；从 adversarial ML / 模型保护扩展生成式和 agentic AI。 美国 Austin；产业安全研究团队 | 产业 · [资料](https://www.hiddenlayer.com/about-us) | 独立 · 成长 |
| [Pillar Security](investigation-ai-security-startups-latest.html#company-pillar-security) | 2025 公开 seed 融资；成立年本次未用一手确认。 以色列研发背景 / 美国 Miami 商业联系 | 产业 · [资料](https://www.pillar.security/about) | 独立 · 种子 |

### A2 · 评测与 AI 红队

| 公司 | 起步与地理联系 | 团队路径 | 本次可核状态 |
| --- | --- | --- | --- |
| [Lakera](investigation-ai-security-startups-latest.html#company-lakera) | 2021 创立；早于 ChatGPT 公测，后以 GenAI Guard / Red 商业化。 瑞士 Zurich / 美国 San Francisco；现属 Check Point | 产业 · [资料](https://www.checkpoint.com/press-releases/check-point-acquires-lakera-to-deliver-end-to-end-ai-security-for-enterprises/) | 已收购 |
| [Robust Intelligence](investigation-ai-security-startups-latest.html#company-robust-intelligence) | 2019 创立；先覆盖 predictive ML，后扩展生成式 AI。 美国 San Francisco；Harvard 师生团队，现属 Cisco | 学术 · [资料](https://www.ciscoinvestments.com/portfolio/robust-intelligence) | 已收购 |
| [Mindgard](investigation-ai-security-startups-latest.html#company-mindgard) | 2022 创立；大学十余年研究是前史，不能算作公司成立年。 英国 Lancaster spinout；London / 美国 Boston | 混合 · [资料](https://mindgard.ai/about) | 独立 · 成长 |
| [Lasso Security](investigation-ai-security-startups-latest.html#company-lasso-security) | 2023 创立；从 LLM touchpoints 扩展 intent 与 agent actions 控制。 以色列 Tel Aviv / 美国 New York | 产业 · [资料](https://www.lasso.security/the-team) | 独立 · 成长 |
| [Virtue AI](investigation-ai-security-startups-latest.html#company-virtue-ai) | 2024 创立（Lightspeed 公司页）；2025-04 公开合并融资。 美国 San Francisco；Berkeley / Stanford 等学术根源，现属 Fortinet | 学术 · [资料](https://www.virtueai.com/virtue-ai-team) | 已收购 |
| [Enkrypt AI](investigation-ai-security-startups-latest.html#company-enkrypt-ai) | 2022 创立（公司官方稿）；2024 seed 公开起步。 美国 Boston；Yale PhD 创始人，现属 Anaconda | 混合 · [资料](https://www.enkryptai.com/newsroom/enkrypt-ai-agent-security-solution-to-mitigate-risk-and-non-compliance) | 已收购 |
| [Giskard](investigation-ai-security-startups-latest.html#company-giskard) | 2021成立；源于生产AI的测试、质量和安全问题，后扩展至LLM与agent红队。 法国起源；欧洲团队，服务全球企业 | 混合 · [资料](https://www.giskard.ai/about) | 独立 · 成长 |
| [君同未来 GenTel](investigation-ai-security-startups-latest.html#company-gentel) | 现法人2024-06成立（工商转载及访谈）；团队/君同智能2021已产业化，不把官网版权年当现法人创办年。 杭州总部；上海、广州布局，浙大相关科研团队 | 学术 · [资料](https://www.gentel.com/zh/home) | 独立 · 未知 |
| [瑞莱智慧 RealAI](investigation-ai-security-startups-latest.html#company-realai) | 2018-07成立，属于LLM之前AI安全公司进入新赛道，不能称ChatGPT后新创。 北京总部；清华人工智能研究院科研孵化 | 学术 · [资料](https://www.realai.ai/about) | 独立 · 成长 |

### A3 · 运行时防护与 AI 使用治理

| 公司 | 起步与地理联系 | 团队路径 | 本次可核状态 |
| --- | --- | --- | --- |
| [Prompt Security](investigation-ai-security-startups-latest.html#company-prompt-security) | 2023 创业；以员工 GenAI 使用、开发工具和内部应用的安全控制起步。 美国商业市场 / 以色列创始研发团队；现属 SentinelOne | 产业 · [资料](https://www.streetinsider.com/ACCESS%2BNewswire/Prompt%2BSecurity%2BRaises%2B%2418M%2BSeries%2BA%2Bto%2BAccelerate%2BIts%2BMission%2Bto%2BSecure%2BGenAI%2Bin%2BEnterprises/24009444.html) | 已收购 |
| [Aim Security](investigation-ai-security-startups-latest.html#company-aim-security) | 2022 创立；2024 公开起步，专注企业 GenAI 安全采用。 以色列 Tel Aviv；现属 Cato Networks | 产业 · [资料](https://www.ylventures.com/news-and-insights/blog/ushering-in-the-next-revolution-introducing-aim-holistic-security-for-genai/) | 已收购 |
| [WitnessAI](investigation-ai-security-startups-latest.html#company-witnessai) | 2023 开始孵化，2024-05-21 公开起步。 美国 Mountain View；Ballistic Ventures 孵化 | 产业 · [资料](https://witness.ai/about-us/) | 独立 · 成长 |

### A4 · agent 行动、身份与权限

| 公司 | 起步与地理联系 | 团队路径 | 本次可核状态 |
| --- | --- | --- | --- |
| [Invariant Labs](investigation-ai-security-startups-latest.html#company-invariant-labs) | ETH AI Center 衍生团队；2025-06-24 宣布已被 Snyk 收购。 瑞士 ETH Zurich spinout；现属 Snyk | 学术 · [资料](https://snyk.io/news/snyk-acquires-invariant-labs-to-accelerate-agentic-ai-security-innovation/) | 已收购 |
| [Zenity](investigation-ai-security-startups-latest.html#company-zenity) | 2021 成立，low-code/no-code 安全前史，后扩展 copilot/agent。 以色列起源、美国商业市场 | 产业 · [资料](https://zenity.io/company) | 独立 · 成长 |
| [Astrix Security](investigation-ai-security-startups-latest.html#company-astrix) | 2021 成立，非人身份 NHI 安全前史。 Tel Aviv 创始研发与美国企业市场 | 产业 · [资料](https://astrix.security/learn/news/astrix-raises-45m-series-b-to-redefine-identity-security-for-the-ai-era/) | 已收购 |
| [Token Security](investigation-ai-security-startups-latest.html#company-token-security) | 2023 新创，2026 官方访谈称约两年半公司。 以色列新创、美国商业市场 | 产业 · [资料](https://www.token.security/company/about) | 独立 · 成长 |
| [Oasis Security / Cyera Identity](investigation-ai-security-startups-latest.html#company-oasis) | 2022 成立，身份安全前史后扩展 agentic access。 以色列团队起源、New York 企业商业入口 | 产业 · [资料](https://www.oasis.security/about-us) | 已收购 |

### B1 · 攻击与漏洞发现验证

| 公司 | 起步与地理联系 | 团队路径 | 本次可核状态 |
| --- | --- | --- | --- |
| [Escape](investigation-ai-security-startups-latest.html#company-escape) | 2020成立，早于ChatGPT；从API安全扩展为攻击面、DAST与AI渗透测试平台。 法国起源；巴黎及旧金山商业布局 | 产业 · [资料](https://escape.tech/blog/seed-fundraising-api-security/) | 独立 · 成长 |
| [XBOW](investigation-ai-security-startups-latest.html#company-xbow) | 2024年1月成立，LLM后新创。 美国 Seattle 总部表述；跨国分布团队 | 混合 · [资料](https://xbow.com/blog/xbow-seed-investment) | 独立 · 成长 |
| [RunSybil](investigation-ai-security-startups-latest.html#company-runsybil) | 2023成立，LLM后新创。 美国 San Francisco / New York；远程团队 | 产业 · [资料](https://www.runsybil.com/careers?ashby_jid=9f668bdf-e5ed-4f7d-8300-117f1ccc2bab) | 独立 · 成长 |
| [AISLE](investigation-ai-security-startups-latest.html#company-aisle) | 2025-10-16公开上线；未由本次一手资料确定注册成立年份。 美国 San Francisco + 捷克 Prague | 混合 · [资料](https://aisle.com/newsroom/press-releases/aisle-emerges-from-stealth) | 独立 · 未知 |
| [Horizon3 / NodeZero](investigation-ai-security-startups-latest.html#company-horizon3) | 2019成立，LLM前自主渗透先行者。 美国 San Francisco | 产业 · [资料](https://horizon3.ai/about-us/) | 独立 · 成长 |
| [Simbian](investigation-ai-security-startups-latest.html#company-simbian) | 2024-04-11出隐身；注册成立年本次未核。 美国 Mountain View | 产业 · [资料](https://simbian.ai/press-releases/simbian-emerges-from-stealth-with-10m-to-build-fully-autonomous-security-platform) | 独立 · 种子 |
| [Tenzai](investigation-ai-security-startups-latest.html#company-tenzai) | 2025成立；2025-11-04公告出隐身，LLM后新创。 以色列 Tel Aviv；面向北美与欧洲企业市场 | 产业 · [资料](https://www.tenzai.com/press-releases/tenzai-raises-75-million-in-record-seed-round-to-build-an-ai-hacker-that-secures-code-written-by-ai) | 独立 · 种子 |

### B2 · 修复与漏洞管理

| 公司 | 起步与地理联系 | 团队路径 | 本次可核状态 |
| --- | --- | --- | --- |
| [Aikido Security](investigation-ai-security-startups-latest.html#company-aikido) | 2022成立；SaaS创业者从开发者噪声与工具整合切入，后加入自主攻击和修复。 比利时Ghent起源；拓展美国市场 | 产业 · [资料](https://www.aikido.dev/blog/aikido-security-raises-eur2-million-pre-seed-round-to-build-a-developer-first-software-security-platform) | 独立 · 成长 |
| [ZeroPath](investigation-ai-security-startups-latest.html#company-zeropath) | 2024成立、YC S24，LLM后新创。 美国 San Francisco | 产业 · [资料](https://www.ycombinator.com/companies/zeropath) | 独立 · 种子 |
| [Corgea](investigation-ai-security-startups-latest.html#company-corgea) | 2023成立、YC S23；早期从数据安全转向代码修复。 美国 San Francisco；Jordan有工程招聘 | 产业 · [资料](https://www.ycombinator.com/companies/corgea) | 独立 · 种子 |

### B3 · SOC 调查与响应

| 公司 | 起步与地理联系 | 团队路径 | 本次可核状态 |
| --- | --- | --- | --- |
| [Dropzone AI](investigation-ai-security-startups-latest.html#company-dropzone-ai) | 2023成立，ChatGPT公开后三个月起步。 美国 Seattle | 产业 · [资料](https://www.dropzone.ai/company) | 独立 · 成长 |
| [Prophet Security](investigation-ai-security-startups-latest.html#company-prophet-security) | 2023秋BCV Labs孵化，2024-04-23公开。 美国 Palo Alto | 产业 · [资料](https://baincapitalventures.com/insight/prophet-security-is-using-ai-to-cut-mean-time-to-response-by-10x-for-security-operations-teams/) | 独立 · 成长 |
| [7AI](investigation-ai-security-startups-latest.html#company-7ai) | 2024成立，2025年2月出隐身。 美国 Boston运营；以色列安全产业/军方背景创始团队 | 产业 · [资料](https://7ai.com/company) | 独立 · 成长 |
| [Torq](investigation-ai-security-startups-latest.html#company-torq) | 2020成立，LLM前hyperautomation前史。 美国与以色列经营/研发，分布加拿大和欧洲 | 产业 · [资料](https://torq.io/company/) | 独立 · 成长 |
| [Radiant Security](investigation-ai-security-startups-latest.html#company-radiant-security) | 2021成立，LLM前创立；2023公开AI SOC。 美国湾区；以色列安全产业团队渊源 | 产业 · [资料](https://lsvp.com/company/radiant-security/) | 资产转移 |

## 3. Security for AI：从模型入口走向行动控制

### 3.1 模型与供应链：Protect AI、HiddenLayer、Noma

**Protect AI** 于 2022 年起步，创始人 Ian Swanson、Daryan Dehghanpisheh、Badar Ahmed，Seattle 产业团队。它的一个重要切口是模型工件安全：下载一个模型不只是下载权重，序列化格式和加载过程可能带入执行风险。ModelScan、LLM Guard 等开发者工具入口与商业平台的资产、测试、防护能力构成不同层次。2024 年 B 轮 $60M，随后在 2025-07-22 被 Palo Alto Networks 完成收购。当前 Prisma AIRS 的模块覆盖 agent、红队、运行时和模型等；应区分收购前创业产品和收购后平台扩展，不能把今日套餐全部倒算为创始产品能力。[投资方团队资料](https://salesforceventures.com/perspectives/market-map-our-security-portfolio/)、[投资方 B 轮披露](https://www.linkedin.com/posts/evolution-equity-partners_protect-ai-raises-60m-in-series-b-financing-activity-7224809947715305473-_dke)、[收购完成公告](https://investors.paloaltonetworks.com/news-releases/news-release-details/palo-alto-networks-completes-acquisition-protect-ai)、[2026 财年 10-K 的产品与交易披露](https://www.sec.gov/Archives/edgar/data/1327567/000132756726000023/panw-20260731.htm)。

**HiddenLayer** 同样于 2022 年成立，Christopher “Tito” Sestito、Tanner Burns、Jim Ballard 是创始团队，美国 Austin；背景来自恶意代码检测、Cylance 与对抗 ML。产品将 Discovery、Supply Chain Security、Attack Simulation、Runtime 分开，2026 年进一步强调 coding-agent harness 与 agentic runtime。2026-09-02 宣布 $100M B 轮，Delta-v Capital 领投；已核的 $6M seed、$50M A 与本轮合计**至少 $156M**，这是披露轮次加总下限。它体现传统对抗 ML 经验向 agent 工作流的延伸，不能因为某模型文件通过扫描就断言 agent 无法被语义攻击。[团队](https://www.hiddenlayer.com/about-us)、[技术起源](https://www.hiddenlayer.com/podcasts/chris-tito-sestito-ceo-amp-co-founder-hiddenlayer)、[官网收录的 seed 媒体稿](https://www.hiddenlayer.com/news/hiddenlayer-emerges-from-stealth-to-protect-ai-models-from-attacks)、[B 轮与产品方向](https://www.hiddenlayer.com/news/hiddenlayer-100m-series-b-ai-security)。

**Noma** 成立于 2023 年，Niv Braun、Alon Tron 创立，以色列研发与美国商业市场相连；现管理团队包括 CISO Diana Kelley、CRO Ralph Pisani 等。初始平台通过云、代码库、MLOps 和 SaaS 接口形成资产与供应链视图，当前扩展 AI-SPM、Agent Access Control、AI-DR、AI Red Teaming，并区分 endpoint、SaaS 和自建 agents。2025-07-31 B 轮 $100M，Evolution Equity 领投，加此前 seed+A 合计 $32M，已核披露合计 $132M。厂商公布的 ARR 增幅没有绝对基数，不能据此和另一家比较营收规模。资产连接器让它知道配置和风险，真正限制动作仍要确认运行时 enforcement 覆盖。[起步与架构](https://noma.security/blog/introducing-noma-the-unified-platform-for-ai-security)、[投资方的早期轮次口径](https://ballisticventures.com/why-we-led-the-series-a-round-in-noma/)、[B 轮](https://noma.security/blog/noma-security-raises-100m-to-drive-adoption-of-ai-agent-security)、[当前团队与模块](https://noma.security/about)。

**这一组的取舍：** AI 资产发现可以较快接入既有 CISO 工作流，覆盖范围也是平台优势；但“全生命周期”是产品组织方式，不能省掉每个控制点的威胁模型。模型供应链、配置姿态和 agent 行为的失败原因不同，需要分别验收。

### 3.2 语义防护与企业 AI 使用治理：Lakera、Lasso、Prompt、Aim、Witness

**Lakera** 是 2021 年的瑞士创业公司，David Haber、Mateo Rojas-Carulla、Matthias Kraft 创立，Zurich/San Francisco 双中心。Guard 提供 prompt attacks、内容、泄漏和恶意链接等检测 API；Red 提供包括有状态 agent 在内的测试接口，Gandalf 攻击游戏构成研究与攻击样本获取渠道之一。2024-07 的 $20M A 轮后当时累计 $30M；2025 年并入 Check Point。当前文档品牌为 Check Point AI Guardrails。API 输出检测结果与分数，应用根据策略阻断或告警，这不能单独保证工具权限和整个 agent 任务安全。收购方宣传的检出率与延迟需按其数据集和部署条件理解。[收购与团队](https://www.checkpoint.com/press-releases/check-point-acquires-lakera-to-deliver-end-to-end-ai-security-for-enterprises/)、[A 轮公司通讯稿](https://www.hpcwire.com/aiwire/2024/07/24/lakera-raises-20m-series-a-to-secure-generative-ai-applications/)、[防护文档](https://docs.lakera.ai/docs/defenses)、[有状态测试接口](https://docs.lakera.ai/docs/red/custom-api-formats)。

**Lasso** 于 2023 年成立，Tel Aviv/New York，官方列 Elad Schulman、Ophir Dror、Lior Ziv、Yuval Abadi 四位共同创始人，背景跨连续创业、AI/安全与运营。2026-09-02 的 $30M 融资稿同时发布 **LEAP + RAPID** 路线：高置信流量由 CPU 上的非 Transformer 专用分类架构快速处理，复杂或不确定策略交给自托管 LLM judge；red teaming 的攻击反馈可以帮助更新检测。这是延迟、成本与语义能力取舍的清楚案例，内部实现并未公开到足以推断训练方法。[团队](https://www.lasso.security/the-team)、[融资与路线](https://www.lasso.security/resources/lasso-security-announces-future-of-ai-security-with-cpu-based-guardrails)。

Lasso 的 2026-09-09 自测含 11,887 条文本，2,498 条攻击、9,389 条正常输入，平均约 466 tokens。CPU classifier 与 GPU/API 对手的部署条件不同，不能把它的表变成所有 guardrails 的公平排名，更不能把文本检测率换算成真实多步 agent 安全率。本档案只据此说明**厂商已发布分层检测路线和自测材料**，未独立验证性能。融资公告正文未明确轮次名称，故写“$30M 融资”，不采用数据库的 A 轮标签；与已核 $6M seed 合计至少 $36M。[原始自测说明](https://www.lasso.security/blog/introducing-leap-cpu-based-ai-security-guardrails-with-gpu-class-accuracy)、[seed 公告](https://www.lasso.security/resources/lasso-security-funding-announcement-2023)。

**Prompt Security** 是 2023 年的以色列产业团队，Itamar Golan、Lior Drihem 创立，具有 Orca/Check Point 等经历，面向美国企业市场。先解决员工用 AI、coding assistant 和 shadow AI 的可见性与敏感数据外流，再扩展自建应用、local agents 和 MCP。2024-11 A 轮 $18M，seed+A 已核合计 $23M；2025-09-05 完成 SentinelOne 收购。它更接近“企业已经在用 AI，如何纳管”的预算：浏览器、代理或 API 的覆盖决定政策能在哪里执行。数据经过安全平台也形成新的隐私与保密要求，接入工具目录的数量不等于全部调用路径已被验证。[A 轮公司通讯稿](https://www.streetinsider.com/ACCESS%2BNewswire/Prompt%2BSecurity%2BRaises%2B%2418M%2BSeries%2BA%2Bto%2BAccelerate%2BIts%2BMission%2Bto%2BSecure%2BGenAI%2Bin%2BEnterprises/24009444.html)、[买方产品说明](https://www.sentinelone.com/press/sentinelone-to-acquire-prompt-security-to-advance-genai-security/)、[交易完成 8-K](https://www.sec.gov/Archives/edgar/data/1583708/000110465925088079/tm2525181d1_8k.htm)。

**Aim Security** 于 2022 年成立，Matan Getz、Adir Gruss，Tel Aviv，来自以色列情报技术与企业安全生态。覆盖员工 public AI、自建应用及 agent 的 AI Firewall 与姿态管理。2024-06-17 A 轮 $18M、当时累计 $28M；Cato 于 2025-09-03 宣布已经收购，交易稿区分当时可独立部署的产品与计划接入 SASE 的功能。把治理放到已有企业通信执行点，是它与模型评测公司的不同商业路线；“计划整合到平台”的时间表需要后续产品资料确认，不能只因时间已经过去就判为全部实现。[投资者介绍与团队](https://www.ylventures.com/news-and-insights/blog/ushering-in-the-next-revolution-introducing-aim-holistic-security-for-genai/)、[A 轮交易律师披露](https://www.fenwick.com/insights/experience/fenwick-represents-canaan-partners-in-aim-securitys-18m-series-a-funding)、[Cato 收购与整合范围](https://www.catonetworks.com/news/cato-acquires-aim-security-to-extend-sase-leadership-and-secure-enterprise-ai-transformation/)。

**WitnessAI** 于 2023 年由 Ballistic 孵化，Rick Caccia 等产业团队起步，Mountain View；Caccia 有 Palo Alto、Google、Symantec、ArcSight、Exabeam 等产品经营经历。Observe/Control/Protect/Attack 从企业 AI 流量观测和策略切入，2026 年增加 tool-call trace、policy-as-code 与 agent 行为控制。2024 的 $27.5M A 与 2026-01-13 的 $58M strategic round，已核披露合计至少 $85.5M。董事、顾问与全职技术团队不能混为一谈；“模型无关”说明接入方式，不说明每个执行路径都有完整轨迹。[孵化与 A 轮](https://witness.ai/resources/witnessai-raises-27-5-million-to-enable-safe-use-of-ai/)、[2026 融资与产品](https://witness.ai/resources/witnessai-raises-58-million-for-global-expansion-and-announces-new-ways-to-secure-ai-agents/)、[管理层](https://witness.ai/about-us/)。

### 3.3 红队与持续验证：学术团队和攻击工程团队各有切口

**Robust Intelligence** 于 2019 年由 Harvard 教授 Yaron Singer 与学生/合作者 Kojin Oshiba 创立，美国 SF。它从传统 predictive ML 的持续验证、robustness 延伸到 LLM red teaming 和 AI Firewall，2024 年被 Cisco 完成收购并进入 AI Defense。已有 algorithmic validation 研究不代表未知攻击不会绕过；2022 前的前史也是它与纯 LLM 后新创的区别。公开累计融资存在不同资料口径，因此表内不填一个看似精确的总额。[Cisco 投资者人物资料](https://www.ciscoinvestments.com/portfolio/robust-intelligence)、[带 completed 更新的官方公告](https://blogs.cisco.com/news/fortifying-the-future-of-security-for-ai-cisco-announces-intent-to-acquire-robust-intelligence)、[现产品归属](https://www.cisco.com/site/us/en/products/security/ai-defense/robust-intelligence-is-part-of-cisco/index.html)。

**Mindgard** 是 2022 年的 Lancaster University spinout；创始人 Peter Garraghan 现为 Chief Science Officer，现 CEO James Brear，团队还有 Aaron Portnoy、Rich Smith 等 offensive-security 专家，London/Boston。其路线是动态触发真实 AI 应用、agent 和工具的行为，配合 shadow AI 发现与 runtime；学术机制与攻击工程形成组合。2026-08-12 $30M A 轮，Album VC 领投；大学已确认此前 $8M 融资，已核至少 $38M。创业年份不等于研究起始年份，旧稿中的 CEO 职位也不能沿用。自称 DART 的产品方法需按实际 target、oracle 和部署范围分析。[大学起源与融资](https://www.lancaster.ac.uk/sci-tech/about-us/news/lancaster-spinout-mindgard-raises-8m-to-revolutionise-ai-security)、[现团队](https://mindgard.ai/about)、[2026 A 轮](https://mindgard.ai/blog/mindgard-raises-30m-series-a)。

**Pillar** 由 Dor Sarig、Ziv Karliner 创立，背景包括 Israeli MoD、Perimeter81、Cymulate、IBM Trusteer、Aqua，具有攻击与供应链安全经验。2025-04-16 seed $9M，Shield 领投；产品和研究围绕 AI graph、持续红队与运行时展开，coding-agent rules files、MCP 等攻击面尤其值得读。公开研究证明团队能够构造具体攻击，不证明闭源防护覆盖所有变种。官网当前重复列出不同职位，本文仅使用创始人身份；常见资料称 2023 成立，本轮未获充分一手依据，保留未知。[团队](https://www.pillar.security/about)、[seed](https://www.pillar.security/blog/pillar-security-raises-9m-to-help-companies-build-and-run-secure-ai-software)、[研究与 Red Graph](https://www.pillar.security/blog)。

**Virtue AI** 于 2024 年成立，创始团队包括 Bo Li、Dawn Song、Sanmi Koyejo、Carlos Guestrin，连接 Chicago/Berkeley/Stanford 的 AI robustness 与安全研究。2025-04 seed+A 合计 $30M，Walden/Lightspeed 参与。多模态测试、guardrails、Guardian Agent 等能力可见于官方说明，2026-08-17 已被 Fortinet 收购。论文与 benchmark 声誉能说明研究积累，但不能自动证明商业产品对任意企业 agent 的效果。当前人才归属与收购前 founding team 应分别阅读，收购未披露具体对价。[创始团队](https://www.virtueai.com/virtue-ai-team)、[投资方成立资料](https://lsvp.com/company/virtue-ai/)、[融资原文](https://waldencatalyst.com/blog/why-we-invested-in-virtue-ai-building-the-future-of-safe-and-secure-ai)、[Fortinet 收购与产品范围](https://www.fortinet.com/corporate/about-us/newsroom/press-releases/2026/fortinet-advances-continuous-ai-protection-with-the-acquisition-of-virtue-ai)。

**Enkrypt AI** 于 2022 年由 Sahil Agarwal、Prashanth Harshangi 创立，Boston；官方称 Yale PhD 专家创业，学校资料独立确认 Sahil PhD’18。提供部署前红队、客户环境 guardrails、MCP 扫描与合规证据映射。已核 2024-02-27 seed $2.35M，完整累计未知；2026-08-04 已被 Anaconda 收购，体现安全能力嵌入模型/包治理与数据科学开发平台的渠道路线。厂商对 MCP 目录扫描的脆弱比例来自其检测和分类方法，不能推为整个生态的真实发生率；合规映射也不是自动获得合规结论。[公司前史/团队](https://www.enkryptai.com/newsroom/enkrypt-ai-agent-security-solution-to-mitigate-risk-and-non-compliance)、[Yale 学校资料](https://som.yale.edu/event/2024/10/cross-promoted-event-yale-alumni-non-profit-alliance-magnifying-your-mission)、[seed 原稿](https://www.enkryptai.com/newsroom/enkrypt-ai-secures-2-35-million-in-seed-round)、[Anaconda 交易与产品说明](https://www.anaconda.com/press/anaconda-acquires-enkrypt-ai)。

**共同取舍：** 红队平台可以更快获得攻击数据并成为上线门禁，但需证明回归能力、误报处理和发现可操作性。研究型团队的一个长期价值是持续找到新的失败模式；卖给客户的产物仍须是可重现证据和能进入工程流程的修复路径。Giskard 与中国团队在第 5 节继续比较。

### 3.4 agent 行动与身份：Invariant、Zenity、Astrix、Token、Oasis

**Invariant Labs** 是 ETH Zurich 学术团队，Marc Fischer、Luca Beurer-Kellner、Martin Vechev、Florian Tramèr，2025-06-24 Snyk 宣布已收购。公开 Guardrails 把 Message、ToolCall、ToolOutput 组成 trace，用规则检查调用顺序、参数与内容，也可调用 prompt-injection 或 secret detector。MCP-scan 的 tool-description poisoning 和 toxic-flow 研究提醒：工具元数据也能成为不可信指令，并影响另一可信工具。[收购与团队](https://snyk.io/news/snyk-acquires-invariant-labs-to-accelerate-agentic-ai-security-innovation/)、[Guardrails README 固定提交 2340fe2（2026-01-12）](https://github.com/invariantlabs-ai/invariant/blob/2340fe2d9cd619f73d5b67fa05bf8a08c7cad515/README.md)、[tool poisoning 演示](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks)、[toxic-flow 分析](https://invariantlabs.ai/blog/toxic-flow-analysis1)。

这种规则可以表达“从不可信输入到某类外发动作”的上下文，比孤立文本标签更接近业务风险；但 trace 顺序不自动证明严格程序级数据因果。保证仍依赖完整观测、阻断 hook、策略充分性和模糊 detector 的误差。本文依据公开接口和研究解释机制，没有做代码运行或商业产品测试。

**Zenity** 于 2021 年创立，Ben Kliger、Michael Bargury，起于 low-code/no-code 应用治理，随后扩展 copilot 和 agent；属于已有控制点向新需求迁移。当前 Surface/Enforce/Protect 分别组织资产与姿态、动作边界和持续监测，覆盖 SaaS、自建、endpoint agents。2026-08-03 C 轮 $125M，Norwest 领投，SoftBank Vision Fund 2、Qumra、Hitachi、LG 等参与。Black Hat/BlueHat 等研究与企业治理经验是团队资产，但“到处覆盖”的表述要进一步核实不同平台的 hook 和例外处理。[公司前史](https://zenity.io/company)、[当前平台](https://zenity.io/platform)、[C 轮](https://zenity.io/press-release/zenity-raises-125-million-to-secure-the-era-of-1-billion-ai-agents)。

**Astrix** 于 2021 年由 Alon Jackson、Idan Gour 创立，Tel Aviv，两人为 Unit 8200 背景，最初做非人身份（NHI）的发现与过量权限治理。2026 年 Agent Control Plane/Agent Policies 扩展到 agent 可执行的动作；Cisco 官方公告在 2026-06-29 更新为收购完成。已核 2024-12 B 轮 $45M、当时累计 $85M。NHI 发现和凭证治理有较成熟的企业接口，但短时 agent 的委托人、任务、权限与撤销语义不能仅靠 service-account 清单解决。[融资与团队](https://astrix.security/learn/news/astrix-raises-45m-series-b-to-redefine-identity-security-for-the-ai-era/)、[2026 policy 扩展](https://www.prnewswire.com/news-releases/astrix-security-delivers-the-most-comprehensive-ai-agent-discovery-and-enhances-security-with-agent-policy-enforcement-302719653.html)、[Cisco 完成更新](https://blogs.cisco.com/news/cisco-announces-intent-to-acquire-astrix-security)。

**Token Security** 是 2023 年的以色列新创，Itamar Apelblat、Ido Shlomo，主要做 agent/NHI identity-first security。其公开架构自述连接 agent 平台与目标业务应用，在两端做治理与 enforcement，并不要求所有流量经过中间 broker；因此关键验收问题是两端的可见性与行动覆盖。已核 2025-01-28 A 轮 $20M，当时累计 $27M，Notable/TLV Partners 参与；数据库出现其他轮次线索，本轮未获一手确认，不把这 $27M 冒称 2026 精确现值。[团队](https://www.token.security/company/about)、[公司发布的融资稿](https://www.prnewswire.com/news-releases/token-security-raises-20m-to-secure-enterprises-machine-identities--from-legacy-applications-to-ai-agents-302361620.html)、[2026 架构访谈](https://www.token.security/blog/giving-ai-agents-an-identity-and-a-leash-a-brand-spotlight-itamar-apelblat-and-ido-shlomo-token-security)。

**Oasis** 于 2022 年由 Danny Brickman、Amit Zimerman 创立，身份安全起步，产品将 agent、身份、权限、短时访问和政策关联；美国商业入口与以色列团队相连。2026-03-19 B 轮 $120M、累计 $195M，Craft 领投，Cyberstarts/Sequoia/Accel 参与。7 月的拟收购已被后续事实替代：Cyera 在 2026-09-03 公告完成 $1B 收购，产品成为 Cyera Identity。它提示**“谁能访问”与“数据有多敏感”**的结合正在成为平台整合方向；这仍不等于对 prompt injection 的完整解决。[创始人前史](https://www.oasis.security/blog/next-generation-ai-security-platform)、[融资原稿](https://www.newswire.com/news/oasis-security-raises-120m-series-b-to-secure-the-rise-of-enterprise-22748198)、[收购完成](https://www.cyera.com/press-releases/cyera-completes-acquisition-of-oasis-security)。

## 4. AI for Security：从建议走向可验证工作

### 4.1 主动攻击：XBOW、RunSybil、Tenzai

**XBOW** 于 2024-01 成立，美国 Seattle 与分布式团队。Oege de Moor 将 Oxford、Semmle/CodeQL 与 GitHub Copilot 的经历带入创业，早期队伍同时有 Copilot 工程成员与漏洞研究者。路线是 LLM 提出并执行攻击，**validator 独立确认结果**；例如 headless browser 检查 XSS 是否真的执行，而不是因为输出里写了 XSS 就相信模型。产品允许域/URL scope、受保护页面、影响展示等级等配置，文档描述每条攻击命令经过独立 safety judge 与确定规则。本轮仅核验公开文档，不证明任意目标上无副作用。[团队与 seed](https://xbow.com/blog/xbow-seed-investment)、[验证器技术复盘](https://xbow.com/blog/top-1-how-xbow-did-it)、[安全执行配置](https://docs.xbow.com/console/get-started/trust-and-safety/)。

XBOW 在 2026-03-18 宣布 $120M C 轮，DFJ Growth/Northzone 领投；5 月追加 $35M，**C 轮两次披露合计 $155M**。公告自报客户超过 100、员工超过 250，是有日期的公司快照。2025-06 的美国 HackerOne 第一和 2025 Q2 全球第一，证明其在相关 bug bounty 范围内能产生有价值成果；提交、triaged、resolved、duplicate、informative 是不同状态，不能用约千份提交算成约千个已修复漏洞。目标整理、政策合规和提交前复核仍有人工参与，不能把发现过程自动化写成整个组织无人。[C 轮](https://xbow.com/news/xbow-raises-120m-to-scale)、[追加与组织规模](https://xbow.com/news/xbow-secures-additional-35m-from-strategic-investors)、[全球 Q2 的条件](https://xbow.com/blog/xbow-on-hackerone-whats-next)。

**RunSybil** 于 2023 年成立，美国 SF/NY/remote；Ari Herbert-Voss、Vlad Ionescu 有 OpenAI/Meta 模型研究经历，队伍加入 Mandiant、Trail of Bits 等攻防工程人员。Sybil 围绕 Web/API 测试，当前提供 black/grey/opt-in white-box；专职 agents 探索鉴权、业务逻辑和 injection，经过 critique、clean-session reproduction、去重与误报处理。通过 MCP 把结果交给客户 coding assistant 修补，再重放攻击。这里的本地修复是开发者工作流，不是默认由供应商自动部署生产。[团队与起步](https://www.runsybil.com/careers)、[产品流程](https://www.runsybil.com/platform)。

2026-03-18 宣布 **累计融资 $40M**，Khosla、S32、Anthology Fund 等参与，不能写成本轮融资 $40M。Cursor 等客户案例说明进入实际开发流程，但客户 testimonial 中“少了多少误报”缺少共同预算和 ground truth，不能拿来跨公司排序。其下一层验证问题是：多角色/租户、账号与状态的覆盖如何量化，重放证据在不同环境是否稳定。[融资原稿](https://www.runsybil.com/blog/runsybil-raises-40m-to-build-the-ai-native-platform-for-offensive-security)、[Cursor 案例](https://www.runsybil.com/case-studies/cursor)。

**Tenzai** 是 2025 年 Tel Aviv 新创，Pavel Gurvich、Ariel Zeitlin、Ofri Ziv、Itamar Tal、Aner Mazur。团队来自 Guardicore 与 Snyk 的创业、产品和安全经验，2025-11-04 公开 $75M seed，Greylock/Battery/Lux 共同领投；自主 Web/App 攻击、利用链和重现证据是主要方向。其“top 1%”来自多个 CTF 平台实验，不能直接转为客户实网覆盖和漏洞发现质量。巨额 seed 是资本与团队信誉信号，仍需等待更透明的生产结果和成本证据。[融资、团队与 early deployments](https://www.tenzai.com/press-releases/tenzai-raises-75-million-in-record-seed-round-to-build-an-ai-hacker-that-secures-code-written-by-ai)、[产品与实验自述](https://www.tenzai.com/)。

**这一组的取舍：** 自动攻击越强，目标范围、状态变更、速率和外传限制越重要；validator 的独立性与可靠性决定报告的价值。实际市场还会围绕资产发现、授权输入、修复复测、持续部署和客户责任形成差异，而不只围绕 foundation model 的选择。

### 4.2 源码、安全审查与修复：AISLE、ZeroPath、Corgea

**AISLE** 在 2025-10 公开上线，美国 SF/捷克 Prague。创始组合是 Ondrej Vlcek（前 Avast CEO/Gen Digital president）、Jaya Baloo（前 Rapid7/Avast/KPN CISO）与 Stanislav Fort（Stanford PhD、DeepMind/Anthropic 等研究），把安全经营、CISO 实践与 AI 科学结合。产品用 static reasoning 和 AI-guided fuzzing 建 threat model、选择目标、生成 harness/seeds，再用 sanitizer 和 fuzzing 执行验证，后续生成补丁并测试。完整平台与只做发现/验证的 **Snapshot** 审计服务范围不同；PR 与部署仍需客户批准。可见投资人身份，但本轮未找到可靠公开融资金额，不填估计。[公开发布与团队](https://aisle.com/newsroom/press-releases/aisle-emerges-from-stealth)、[平台机制](https://aisle.com/platform)、[Snapshot 边界](https://aisle.com/snapshot/)。

一个比总 CVE 数更具体的证据是维护者记录：curl 的 [CVE-2026-80255](https://curl.se/docs/CVE-2026-80255.html)描述 Set-Cookie 的 Secure 属性前出现 tab，标志解析丢失，导致 cookie 可能经 HTTP 明文发送，署名报告者为 Stanislav Fort（Aisle Research），修复者 Daniel Stenberg。这证明有效缺陷获得维护者认可，不能单独证明发现全过程没有人工。[HoF-Bench v1（2026-07-29）](https://arxiv.org/abs/2607.27030v1)和[对应代码](https://github.com/weareaisle/HoF-Bench)用 8 个库、95 个已公开 CVE 的固定易受攻击提交，给源码和目标文件、隐藏描述/补丁，研究重发现能力；在固定 scaffold、四次重复 pass 与 triage 下，最多 65/95 是该协议的结果，不能解释成任意代码库盲测发现率。

**ZeroPath** 是美国 SF、2024 年 YC S24 新创，Dean Valentine、Raphael Karger，其中 Karger 具有 Google security/BishopFox 经历。其切口是 AI 代码审查、业务逻辑/鉴权缺陷、修复 PR 和验证；旧技术解释将 LLM 与程序图结合，但该文章已经标为历史版本。2026-06 的 threat-model early access 把架构和信任边界上下文用于 repo、PR 与 coding-agent 扫描。核验日招聘页自报 seed $12.5M，具体本金额披露日期本轮未确认，不能贴到旧 $7M 公告上。生成 PR 不等于自动部署，商业扫描效果还需要真实项目的误报/漏报与补丁验收。[YC 团队与成立资料](https://www.ycombinator.com/companies/zeropath)、[历史架构](https://zeropath.com/blog/how-zeropath-works)、[新 threat modeling](https://zeropath.com/blog/automated-threat-modeling)、[当前融资自述](https://zeropath.com/careers)。

**Corgea** 是 2023 年 YC S23 新创，美国 SF，并有 Jordan 招聘；Ahmad Sadeddin 是连续创业者，前公司被 Coupa 收购。产品从接收 SAST findings 并修补，扩展至 BLAST 的 LLM+AST 检查业务逻辑与 review-ready fixes；2026-06 又发布带源码上下文的 agentic pentest，强调运行时验证和复测。BLAST 官方发布自报 seed $2.7M，Shorooq/YC 等参与；早期媒体金额有差异，不叠加为多个轮次。扫描和修复属于不同交付物，补丁需要安全验证与开发者接受，单个厂商对人类测试的案例不能推为一般性能优势。[YC 产品与团队](https://www.ycombinator.com/companies/corgea)、[BLAST](https://corgea.com/blog/introducing-blast-the-future-of-security-testing-is-here)、[2026 产品发布索引](https://corgea.com/newsroom)。

这一组与 Aikido 的平台路线在第 5 节对照：研究型发现系统、AI AppSec 点工具和已有开发者平台，可以使用相近模型，却通过不同数据和流程获利。

### 4.3 网络/身份攻击路径：Horizon3 的前史很重要

**Horizon3.ai / NodeZero** 于 2019 年成立，美国 SF，Snehal Antani 有 JSOC、Splunk、GE Capital 经历，Anthony Pillitiere 为共同创始人；国家安全/安全产业背景与源码 AI 研究团队不同。其主要任务是在授权环境中验证网络、AD、身份和云的攻击路径，利用 Docker runner 和已有攻击逻辑生成 proof-of-impact、修复建议与 retest。2026-08-03 E 轮 $250M，NightDragon/NEA 领投，公告估值超过 $2B，自报超过 7,000 organizations 与 310,000 production tests。[团队](https://horizon3.ai/about-us/)、[E 轮与产品范围](https://horizon3.ai/news/press-release/horizon3-raises-250m-series-e-at-2b-valuation-to-lead-the-ai-vs-ai-cybersecurity-era/)。

这是一家自主渗透前史早于 LLM 的公司，不宜仅据今天“AI-native”措辞猜它全部由大模型规划。一个能明确核验的 LLM 用法是 ADP：通过 Llama 4 Maverick/AWS Bedrock 对有限的敏感 snippet/schema 做业务风险语义标注，文档明确输出为 advisory，不发起自主动作。自主执行主体与用于解释影响的模型层要分开。[ADP 技术文档](https://docs.horizon3.ai/portal/features/advanced_data_pilfering/)、[2026-09 release notes](https://docs.horizon3.ai/release_notes/2026.09/)。网络攻击路径验证的客户价值是“哪些暴露实际上可利用”，不是与源码系统比赛未知缺陷发现数量。

### 4.4 SOC：Dropzone、Prophet、7AI、Simbian、Torq、Radiant

| 公司与团队 | 工作流与当前方向 | 已核融资及发展 | 需要保留的边界 |
| --- | --- | --- | --- |
| **Dropzone AI**：2023，Seattle，Edward Wu，曾构建 ExtraHop NDR 引擎 | AI SOC Analyst 查询既有 SIEM/EDR/IAM/邮件，形成报告与 audit trail；现产品包括 threat hunt 和 auto-contain | 2025-07-17 B $37M，Theory 领投；2026 初公司自报 300+ production deployments | 官网累计字段与所列轮次算术不一致，本文只列 B；早期 read-only 不能当当前全产品限制 |
| **Prophet Security**：2023 秋孵化、2024 公开；Kamal Shah、Vibhav Sreekanti，StackRox 团队 | planner 选择查询工具、按反馈改调查计划；输出 verdict/timeline/证据，扩展 hunt 与 detection | 2025-07-29 A $30M，Accel/BCV；与 $11M seed 合计已核两轮 $41M | 2024 vector database 架构是当时版本；具体 2026 写权限未全面核验 |
| **7AI**：2024，Boston，Lior Div、Yonatan Striem-Amit，Cybereason 再创业 | 专职 agents 的调查、response、hunt；PLAID 客户定义何时 act/escalate，ELITE 为带专家的服务 | 2025-12-04 A $130M，Index 领投；公告累计 $166M | managed service 案例中专家判断不能算成纯无人软件成绩 |
| **Simbian**：2024-04 公开，Mountain View；Ambuj Kumar、Alankrit Chona，Fortanix/加密/平台工程 | 从 TrustedLLM/copilot 扩到 SOC、pentest、hunt，以 Context Lake 分享环境上下文 | 已核 2024 seed $10M，2026 产品及渠道继续发布；未核新融资金额 | “autonomous”未给完整审批/rollback 文档；论文与生产宣传分母不同 |
| **Torq**：2020 前史，美国/以色列；Ofer Smadari、Leonid Belkind、Eldad Livni，Luminate 连续创业 | hyperautomation/连接器 → Agentic SOC，2026 builder 与 Jit Context Graph | 2026-01-12 D $140M，累计 $332M，估值 $1.2B | 2024 提出的 2026 $100M ARR 是目标；automation 次数不是同数量完整调查 |
| **Radiant**：2021 前史，Shahar Ben-Hador、Barry Shteiman，Exabeam/Imperva 背景 | 自动调查、可解释的判定和可执行响应计划 | 已核 2023 A $15M；2026-08 AI SOC 技术资产/IP 转移 Cribl | 资产收购不等于整个法律实体收购，后续独立产品状态未确定 |

表中对应来源：Dropzone 的[团队](https://www.dropzone.ai/company)、[B 轮](https://www.dropzone.ai/press-release/dropzone-ai-37m-series-b-funding-ai-soc-agents)、[当前产品](https://www.dropzone.ai/ai-soc-analyst)、[2025 总结自报](https://www.dropzone.ai/press-release/dropzone-ai-closes-2025-with-11x-arr-growth-fortune-cyber-60-recognition-and-37m-series-b)；Prophet 的[投资方技术/创始人介绍](https://baincapitalventures.com/insight/prophet-security-is-using-ai-to-cut-mean-time-to-response-by-10x-for-security-operations-teams/)、[A 轮](https://www.prophetsecurity.ai/blog/prophet-security-raises-30-million-series-a-led-by-accel)；7AI 的[团队](https://7ai.com/company)、[A 轮与累计](https://blog.7ai.com/citing-the-agentic-security-inflection-point-7ai-raises-largest-cybersecurity-a-round-in-history-to-bring-ai-security-agents-to-enterprises?hs_amp=true)、[2026 hunt/Skills](https://blog.7ai.com/threat-hunt-skills-launch)、[PLAID 人机和权限设计](https://blog.7ai.com/building-a-foundation-for-ai-in-security?hs_amp=true)；Simbian 的[seed 与团队](https://simbian.ai/press-releases/simbian-emerges-from-stealth-with-10m-to-build-fully-autonomous-security-platform)、[当前发布](https://simbian.ai/press-releases)；Torq 的[团队](https://torq.io/company/)、[D 轮](https://torq.io/news/torq-seriesD/)、[Jit 收购与架构](https://torq.io/blog/torq-acquires-jit/)、[2024 公告中的 ARR 目标](https://torq.io/news/torqseriesc/)；Radiant 的[投资者团队/产品](https://next47.com/using-ai-to-reinvent-security-prioritization/)、[资产交易](https://cribl.io/news/cribl-advances-ai-powered-security-operations-with-new-ai-soc-acquisition/)。

两个例子比“取代分析师”更有用：7AI 的 2026-03 quishing 案例中，agents 先查出 true positive，PLAID ELITE 人员确认二维码钓鱼，再通过人机协作扩展到跨多日 campaign。这是可用服务闭环，不能把专家层抹掉。[原案例](https://blog.7ai.com/quish-splash-when-the-qr-code-is-the-weapon-a-multi-wave-phishing-campaign-that-slipped-past-every-filter?hs_amp=true)。

Simbian 团队的 [Cyber Defense Benchmark v3（2026-04-23）](https://arxiv.org/abs/2604.19533v3)让模型 agent 在原始 Windows 事件数据库里自行查询并标出恶意事件时间；论文的 event-flag recall、[公司新闻稿](https://simbian.ai/press-releases/world-s-first-cyber-defense-benchmark-finds-frontier-ll-ms-alone-do-poor-job-at-attack-discovery)的 tactic 平均值和生产效果自述不是同一指标，不能写成一组“产品提升实验”。它更适合提醒研究者：安全问答准确率与不带提示的环境调查相距很远。

**这一组的取舍：** SOC agent 可以以已有告警为入口，较快连接现有预算；但调查结论对客户专属遥测和上下文高度敏感。连续创业团队带来渠道与客户问题理解，连接器、执行权限、证据纪律和异常升级则是工程壁垒。自动关闭告警还需验证漏报代价，不能只追求吞吐。

## 5. 地区与团队背景：看生态，不按国籍猜能力

### 5.1 地理是一组关系，不是互斥国旗

| 生态/联系 | 本轮可见的公司与团队 | 观察到的产品路线 | 解读限制 |
| --- | --- | --- | --- |
| 美国商业市场与产业/模型实验室 | XBOW、RunSybil、Dropzone、Prophet、Simbian、AISLE；以及多家跨国团队 | 企业软件交付、SOC 现有预算、自动攻击验证、AI 工程与安全人才组合 | 不能由商业总部推断创始人国籍或全部研发位置 |
| 以色列创始研发与美国市场 | Prompt、Aim、Noma、Lasso、Pillar、Zenity、Astrix、Oasis、Token、Tenzai；7AI/Torq 等有团队联系 | 企业执行点、身份、云与安全产业再创业，部分迅速进入大厂 | 只在一手证实处写情报单位背景；不把所有团队都概括成 Unit 8200 |
| 英国/瑞士 | Mindgard、Invariant、Lakera | 大学 spinout、攻防工程、可检查的策略/测试框架及 runtime | Lakera 被以色列买家收购不改变其瑞士起源；Mindgard 也有美国经营入口 |
| 法国/比利时 | Giskard、Escape、Aikido | 质量/安全评测、API 业务语义探索、开发者 AppSec 与本地部署 | 欧洲不只有合规产品；公共研究资金、股权融资不可混加 |
| 中国 | 君同未来与瑞莱智慧；长亭作为传统安全厂商对照 | AI 安全评测、分类检测、安全后训练、政企治理；传统安全工作流加入 agent | 本轮中文披露与可验证新创样本较少，不能推市场份额或没有创新 |

**地理字段允许多选。** 在 HTML 里筛选“美国”或“以色列”可能同时命中一家公司，这是研发、起源和商业市场的联系，而不是把同一家公司算作两个主体。华人姓名、研究者曾读某所大学也不能用于推断公司归属。

### 5.2 Giskard：评测资产与产品质量工作流

**Giskard** 于 2021 年在法国起步，当前公开核心创始团队 Alex Combessie、Jean-Marie John-Mathews，CTO Matteo Dora；前两人有 Dataiku/Thales/Capgemini 工程与 AI ethics 研究联系，现团队也有 AI PhD。它从 ML 质量测试扩展到多轮 agent testing、scenario/trace/check、LLM judges 和自动对抗 test suite；商业 Hub 还提供协作、数据版本、SSO/audit 等。公开 OSS SDK 与完整商业平台不能混为一体，既测安全失败也测业务失败。[团队与年表](https://www.giskard.ai/about)、[创始人自述](https://www.giskard.ai/knowledge/how-did-the-idea-of-giskard-ai-emerge-6-n)、[v3 README 固定提交 4881400（2026-10-09）](https://github.com/Giskard-AI/giskard-oss/blob/48814003452c07c19339278e77a13fa07956d1b7/README.md)、[OSS/Hub 对照](https://docs.giskard.ai/start/comparison)。

资金结构尤其值得保留：官网列 2022 年 €1.5M 首轮、2023 年 €3M EIC strategic investment、2024 年 €3M Bpifrance research grant，**不能统称 €7.5M VC**。2025 发布 Phare 多语 benchmark，体现持续积累评测资产的路线。[融资/资助年表](https://www.giskard.ai/about)、[Phare 原始公告](https://www.giskard.ai/knowledge/giskard-announces-phare-a-new-llm-evaluation-benchmark)。研究者可以利用其 SDK 建可复现测试，但安全失败率仍依赖场景、judge、模型版本和攻击适应性；测试集通过不等于 agent 有全面运行时保证。

### 5.3 Escape：传统语义引擎与 LLM 的混合攻防

**Escape** 于 2020 年在法国成立，Tristan Kalos、Antoine Carossio，YC W23，Paris 与美国市场相连；原始切入点是 API business-logic DAST，后扩展 ASM、agentic pentest 与 remediation。2023-06-06 seed $3.9M（同稿另列 €3.6M），2026-03-10 A $18M，Balderton 领投。2,000+ security teams 等是厂商统计，不能当同数量付费客户。[seed/团队](https://escape.tech/blog/seed-fundraising-api-security/)、[A 轮](https://escape.tech/blog/escape-raises-18m-series-a/)。

CTO 的公开机制说明比“AI pentester”更有区分度：API schema 转成 resolver/resource 图，推断参数依赖和类型，按成功请求、信息收益与对象生命周期调整探索；LLM 用来构造初始输入、根据错误修请求、推断复杂业务场景。说明性 API 中，`/user/{id}` 的 id 实际来自此前响应的 user.ssn；找到这个依赖才能进入有效状态，随后再测试多身份越权。这是图、状态、fuzzing、语义模型的混合路线，不是将传统引擎全部换掉。[原始算法说明与 toy API](https://escape.tech/blog/escape-proprietary-algorithm/)、[2026-10 的产品解释](https://escape.tech/blog/what-is-ai-pentesting/)。schema 不完整、鉴权、状态副作用和权限 oracle 仍限制覆盖；成功请求本身并不等于发现漏洞。

### 5.4 Aikido：从统一 AppSec 平台进入攻击与修复闭环

**Aikido** 于 2022 年在比利时 Ghent 创立，最初卖点是统一 code/cloud/runtime 工具与降噪。2023 初原始公告列 Willem Delbare、Roeland Delrue、Amber Rucker、Felix Garriau 的创始组合，背景为 Teamleader/Officient、Showpad、Veriff/CloudBees、nexxworks/AREA42；不能用今日领导页面替代最初名单。2026-01-14 B 轮 $60M，DST Global 领投，公告估值 $1B，100,000+ teams 和员工数据是公司快照，teams 不等于付费客户。[创始公告](https://www.aikido.dev/blog/aikido-security-raises-eur2-million-pre-seed-round-to-build-a-developer-first-software-security-platform)、[B 轮](https://www.aikido.dev/blog/aikido-funding-series-b)。

2026-02 的 **Infinite** 针对部署改动做 diff-scoped agent pentest、可利用性验证、补丁 PR 和复测；6 月收购 **Root**，补充依赖原版本 backport 的修复能力。平台掌握开发者上下文与交付入口，再通过并购强化能力，是与研究原型创业不同的路线。[Infinite](https://www.aikido.dev/blog/introducing-aikido-infinite)、[Root 收购原稿](https://www.globenewswire.com/news-release/2026/06/30/3319854/0/en/aikido-acquires-root-to-defend-open-source-from-ai-powered-attacks.html)。

2026-09-21 发布的 **Altar** 将 GLM-5.3 经量化与 expert pruning 形成 open-weight 安全模型，服务于本地/隔离部署。内部实验是 32 个已知 CVE、30 个库、每例三次的重发现，不是全库盲测，也未测完整 exploit/fix 闭环；安全微调/自学习等后续内容应保留为计划。它为研究提出了更具体的问题：模型压缩和私有部署怎样改变低频漏洞及长程工具链的可靠性。[Altar 原始技术说明](https://www.aikido.dev/blog/aikido-altar-open-weight-ai-sovereign-security)。2026-10-06 公司另公告 FedRAMP Moderate authorization，本轮没有单独核验官方 Marketplace，因此仅记录公告，不据此推断联邦客户收入。[公司发布稿](https://www.globenewswire.com/de/news-release/2026/10/06/3375697/0/en/aikido-security-achieves-fedramp-moderate-authorization.html)。

### 5.5 中国：新主体、旧研究积累与既有安全厂商并存

**君同未来 GenTel** 位于杭州，CEO 韩蒙等研究员创业，和浙江大学研究团队有联系。现法人主体 2024 年注册的说法来自工商转载与创始人具名访谈，团队/君同智能在 2021 年已开始产业化；本文标为**LLM 后新主体、AI 安全前史**，没有直接核国家工商系统。2024-10-16 36氪报道数千万元人民币天使轮，本轮未找到公司/投资方同轮原始公告。报道内部部分投资人名称不一致，不据此制造精确融资总额。[创始人采访（二手）](https://www.sohu.com/a/872888799_121627717)、[研究团队人员页](https://ifrc-zju.github.io/)、[融资报道（二手）](https://www.36kr.com/p/2993607517170696)。

技术层有更可检查的证据：[GenTel-Safe 论文（2024）](https://arxiv.org/abs/2409.19521)、[项目](https://gentellab.github.io/gentel-safe.github.io/)、[gentelshield-v1 模型卡](https://huggingface.co/GenTelLab/gentelshield-v1)与[数据卡](https://huggingface.co/datasets/GenTelLab/gentelbench-v1)。Shield 从 multilingual E5 embedding 模型起步，使用恶意/良性文本二分类和扰动、改写增强；自建基准成绩不能推为 2026 商业版本的普适性能。商业矩阵覆盖评测、红队增强、防护、监测、标识和实训。2026 的 AI Trust OS 是战略表达，本轮不能据此确认已实现完整 agent 身份/授权执行。[当前产品](https://www.gentel.com/zh/home)、[全生命周期产品公告](https://gentel.com/news/10)、[2026 论坛报道（二手）](https://www.36kr.com/p/3998220412718980)。

**瑞莱智慧 RealAI** 是北京、2018 年清华 AI 研究院孵化公司，CEO 田天，张钹、朱军为首席科学家；它是前史对照，不能说成 LLM 后新成立。产品有模型对抗测评/增强、靶场、隐私计算、deepfake 检测。2021-10-28 官方 A 轮超 3 亿元人民币；2026-07-21 媒体报道 B1+B2 数亿元，本轮未获同轮一手公告，不和旧金额相加成精确累计。[团队与前史](https://www.realai.ai/about)、[官方 A 轮](https://www.realai.ai/news/company-news/234.html)、[产品矩阵](https://www.realai.ai/products?pagenum=1)、[2026 融资报道（二手）](https://finance.sina.com.cn/roll/2026-07-21/doc-iniippin8189003.shtml)。

LLM 新增的可检查技术是 [RealSafe-R1 论文（2025）](https://arxiv.org/abs/2504.10081)及[7B 模型卡](https://huggingface.co/RealSafe/RealSafe-R1-7B)：对 DeepSeek-R1 distilled 系列做安全感知推理轨迹 SFT。作者测试中，7B 的 PAIR 拒答率提高，同时 LiveCodeBench 从 38.23 降到 34.65，说明不能把题名“without compromising”泛化为所有能力零代价。这是模型安全后训练，不等于为带工具 agent 提供任务级授权保证。

**中国 AI for 传统安全的补充对照是长亭，未计入本档案的公司筛选样本。** 它于 2014 年由清华蓝莲花战队核心成员起步，当前公开产品覆盖 AI 渗透、代码扫描/修复、SOC 与漏洞风险运营。它说明新产品也来自拥有客户、攻防数据和交付经验的老厂商。本轮没有逐项实测这些产品，不把产品名称或安全大模型上线当成能力实验结果。[官方前史](https://www.chaitin.cn/intro)、[现产品](https://www.chaitin.cn/zh/)。

**区域观察的边界：** 中国材料较多展示标准、合规、政企场景，英文创业材料较多展示融资、开源、CVE 和 ARR 自报，可能同时反映产品路线与披露方式。本文不根据搜索可见性断言市场规模。资料不足的公司留待继续核验，而不为地理对称凑名单。

### 5.6 团队背景的实用分类

| 团队路径 | 例子 | 往往带来的资源（分析） | 需要验证的缺口 |
| --- | --- | --- | --- |
| 教授/博士研究转化 | Invariant、Mindgard、Virtue、Robust、RealAI | 新失败模式、机制与评测、学术人才网络 | 产品接入、采购、企业工程、研究成果是否持续公开 |
| 安全产业/连续创业 | Prompt、Aim、Pillar、7AI、Torq、Tenzai | CISO 问题、执行点、客户与渠道、再创业组织经验 | 新机制相对已有平台的增量、公开技术可验证性 |
| AI 实验室与攻防工程混合 | RunSybil、XBOW、AISLE | 模型工程、执行验证、程序分析与漏洞经验 | 单位任务成本、授权覆盖、失败分布与人工比例 |
| SaaS/开发者平台 | Aikido、ZeroPath/Corgea 的产品路径 | 工作流入口、代码与部署上下文、修复验收 | 深度安全覆盖、跨客户泛化、平台打包竞争 |

这些分类允许交叉。HTML 用“学术、产业、混合”的简化标签帮助筛选，不把团队内部人员比例假装成已核实数据。顾问/董事、早期创始人、当前高管、普通员工分别是不同身份。

## 6. 用三个场景辨认产品差异

### 6.1 邮件里的指令，如何变成 agent 的数据外流

**分析场景，未在任何商业产品上实测。** 企业 agent 的合法任务是读供应商邮件、查采购系统、草拟回复。攻击者在邮件或附件中嵌入指令，让它向外部地址发送包含采购秘密的内容。

| 控制点 | 可以阻断的环节 | 仍然需要追问 |
| --- | --- | --- |
| 文本/多模态 detector | 读入恶意内容时标记或阻断，减少攻击进入上下文 | 新型攻击、正常业务长文本、跨轮次拼接是否会漏检或误报？ |
| 轨迹/工具策略 | 发现“读取敏感表后向新域发送”违反规则，在 tool call 前拒绝 | 是否观察到全部工具调用、历史状态与目的地？策略如何表达合法业务例外？ |
| 身份与凭证限制 | 不发放不需要的数据库权限；限制凭证有效期和目标资源 | 允许读的资料还能经允许的输出渠道泄漏吗？使用的是用户身份还是 agent 独立身份？ |
| 数据与目的地约束 | 给敏感数据打标签、限制流向，检查外发内容 | 标签传播是否完整？摘要、编码、派生数据怎样处理？ |
| 沙箱/网络边界 | 禁止任意外连或未授权系统调用 | 合法邮件 API 本身是允许的外发通道，沙箱需要上层业务约束协作 |

Lakera/Lasso 一类的内容判断、Invariant 一类的轨迹策略、Astrix/Oasis/Token 的身份治理，可以互补。**“agent 有合法凭证”不证明每个具体动作合法，“detector 没报警”也不等于可执行。** 这是安全设计判断，不是对某个厂商的测试结果。

[AgentDojo 原始论文（2024）](https://arxiv.org/abs/2406.13352)把合法任务完成与攻击目标分别评测，适合避免用“拒绝一切”获得虚假的高安全分数。[CaMeL 论文（2025）](https://arxiv.org/abs/2503.18813)及[作者代码](https://github.com/google-research/camel-prompt-injection)探索把不可信数据的影响置于受控执行和信息流策略中；这是学术设计参考，其保证依赖策略、解释器和被中介操作等假设，不能移植成商业平台的无条件保证。本档案没有复现实验。

### 6.2 找到漏洞，和让客户能够修复漏洞

把“AI 找漏洞”拆成五个交付层级，会发现创业公司的范围并不相同：

1. **提示候选**：模型指出代码可能存在问题；仍需人验证。
2. **历史漏洞重现**：给漏洞描述和修复前代码，生成能触发问题的测试。
3. **盲测新发现**：不知道漏洞位置或性质，探索未标注目标并输出有效 PoC。
4. **客户环境验证**：在明确授权、账号与网络范围内证明可利用性或攻击路径。
5. **修复验收**：补丁通过回归及安全验证，开发者接受，重新测试确认暴露消失。

[CyberGym 原始论文（2025）](https://arxiv.org/abs/2506.02548)主要评估给定文字描述和代码库的历史真实漏洞 PoC 生成，原始数据覆盖 1,507 个漏洞、188 个项目。这个数字说明任务规模，不代表盲测新漏洞发现率，也不是某家公司的产品测试。XBOW 的 bug bounty 表现、Horizon3 的攻击路径验证、Aikido 的内部已知 CVE 重发现，各自回答不同问题。

对漏洞管理，还要区别 **发现 → 去重 → 排序 → 修复 → 复测**。排序产品可以省工时而不创造新漏洞发现能力；补丁产品可以形成开发者工作流优势而不在 hacker 榜上出现。技术购买判断应要求原始证据、失败样本、误报处理和修复结果，而不是只看模型名字。

### 6.3 SOC 告警成为一份可以结案的调查

**分析场景。** 云账号出现可疑登录，调查 agent 查询身份服务、EDR、邮件和网络日志，决定是正常出差还是账号接管。Dropzone/7AI/Prophet 的价值在于自动收集相关证据并组织判断；Torq 还提供已有工具间的流程与执行编排。

这条链路有三个不同的可靠性要求：**查询正确性**（时间窗、账号对应、工具参数）、**证据完整性**（遥测缺失不能当作无攻击）、**响应安全性**（禁用账号会不会中断生产）。报告写得流畅，只说明表达成功。若模型读到攻击者控制的日志字段或邮件，它自己的调查过程也可能受 prompt injection 影响；B3 的产品因此同时需要 A3/A4 的保护。

评测可以使用历史回放、环境专属规则和盲审，把“有证据的结案”与“给出答案”分开，观察误结案率、人工重开率、连接器错误、升级给人的质量，以及可审计的时间线。这里是评测设计建议，未报告任何厂商在共同协议下的成绩。

## 7. 融资、并购与发展：什么能从公开信息推断

### 7.1 交易状态表：截至本次核验已改变的归属

| 原创业公司 | 收购方/当前归属 | 可核验完成记录 | 公开价格口径 | 理解上的变化 |
| --- | --- | --- | --- | --- |
| Robust Intelligence | Cisco / AI Defense | 2024 官方博客 completed 更新 | 本表未采用媒体估价 | 持续模型验证进入安全平台 |
| Protect AI | Palo Alto / Prisma AIRS | 2025-07-22 完成 | 2026 10-K：$635M purchase consideration，含 $608M cash 与 $27M replacement awards 中归属收购前服务的部分 | AI 生命周期技术、人才与平台分发合并 |
| Invariant Labs | Snyk | 2025-06-24 宣布已收购 | 未披露 | agent 轨迹/工具策略进入开发者安全平台 |
| Aim Security | Cato | 2025-09-03 公告已收购 | 未披露 | 企业 AI 使用治理与 SASE 执行点结合 |
| Prompt Security | SentinelOne | 2025-09-05 完成，9 月 8 日 8-K | 约 $180M **现金与股票合计** | endpoint、员工 AI 与 agent 治理结合 |
| Lakera | Check Point | 2025 Q4 完成，2025 全年业绩披露 | 约 $190M **net cash consideration** | LLM runtime 和测试进入既有平台 |
| Astrix | Cisco | 官方博客 2026-06-29 completed 更新 | 未披露 | NHI/agent 身份进入 Cisco 安全组合 |
| Enkrypt AI | Anaconda | 2026-08-04 公告已收购 | 未披露 | 红队/guardrails 进入模型和数据科学开发入口 |
| Virtue AI | Fortinet | 2026-08-17 公告已收购 | 具体对价未披露 | 多模态测试与 agent 防护进入网络安全平台 |
| Radiant AI SOC 技术资产 | Cribl | 2026-08-19，含 IP 的资产收购 | 未披露 | 遥测/数据平台吸收 SOC 能力；不是整个公司收购的证据 |
| Oasis Security | Cyera / Cyera Identity | 2026-09-03 完成公告 | $1B，交易公告口径 | 身份与数据治理形成 agent 访问控制组合 |

交易依据分别为：[Cisco/Robust](https://blogs.cisco.com/news/fortifying-the-future-of-security-for-ai-cisco-announces-intent-to-acquire-robust-intelligence)、[Palo Alto 完成公告](https://investors.paloaltonetworks.com/news-releases/news-release-details/palo-alto-networks-completes-acquisition-protect-ai)、[Palo Alto 10-K](https://www.sec.gov/Archives/edgar/data/1327567/000132756726000023/panw-20260731.htm)、[Snyk](https://snyk.io/news/snyk-acquires-invariant-labs-to-accelerate-agentic-ai-security-innovation/)、[Cato](https://www.catonetworks.com/news/cato-acquires-aim-security-to-extend-sase-leadership-and-secure-enterprise-ai-transformation/)、[SentinelOne 8-K](https://www.sec.gov/Archives/edgar/data/1583708/000110465925088079/tm2525181d1_8k.htm)、[Check Point 全年披露](https://www.checkpoint.com/press-releases/check-point-software-reports-fourth-quarter-and-2025-full-year-results/)、[Cisco/Astrix](https://blogs.cisco.com/news/cisco-announces-intent-to-acquire-astrix-security)、[Anaconda](https://www.anaconda.com/press/anaconda-acquires-enkrypt-ai)、[Fortinet](https://www.fortinet.com/corporate/about-us/newsroom/press-releases/2026/fortinet-advances-continuous-ai-protection-with-the-acquisition-of-virtue-ai)、[Cribl](https://cribl.io/news/cribl-advances-ai-powered-security-operations-with-new-ai-soc-acquisition/)、[Cyera](https://www.cyera.com/press-releases/cyera-completes-acquisition-of-oasis-security)。

另有两笔**补充并购对照**，不计入 36 家主体样本，帮助补齐应用交付与 endpoint/SOC 两种分发入口：

**CalypsoAI → F5。** 2018 年起步，创始人包括 Neil Serebryany，属于 LLM 前史。投资方披露 2023-06-27 $23M Series A-1、彼时累计 $38.2M；完整最新累计未在本轮确认。F5 的 2026-03-31 季报注明 **2025-09-26 交割、$145.2M 现金**，这是本文采用的会计口径，不把签约新闻的 $180M headline 当成相同金额。9 月 29 日的 F5 产品稿已经使用 AI Guardrails / AI Red Team 品牌：红队探测应用弱点，再以运行时检查和策略防护 AI 输入、输出，向 F5 应用交付平台整合。产品发布有证据，所有执行路径的覆盖和未知攻击防御效果仍未独立验证。[投资方团队与融资稿](https://www.paladincapgroup.com/calypsoai-raises-23-million-from-paladin-capital-group-and-strategic-investors-to-drive-secure-enterprise-adoption-of-generative-ai-and-large-language-models/)、[SEC 交割与现金披露](https://www.sec.gov/Archives/edgar/data/1048695/000104869526000051/R11.htm)、[F5 产品发布](https://www.f5.com/company/blog/what-are-ai-guardrails)。

**Pangea → CrowdStrike。** Oliver Friedrichs、Sourabh Satish 有 Phantom/Splunk 前史，从可组合安全 API 扩展到 AI Guard / Prompt Guard，面向开发者接入检查与防护。CEO 2023 年回顾称，2022 年底 $26M B 轮后当时累计超过 $52M；这同样不是重新核实的最新融资总额。CrowdStrike 10-K 确认 **2025-09-26 收购全部股权**，对价分项为 **$212.1M 净现金＋$10.6M 归属购前服务的替代奖励**；净现金已经扣除取得的 $9.4M 现金/受限现金，其余归属未来服务的奖励不计入购买对价。**2025-12-15 Falcon AIDR 已 GA**，整合有完成产品发布证据，说明开发者 guardrails 已进入 endpoint/SOC 分发体系；“全链路保护”的效果仍是厂商主张。[团队](https://pangea.cloud/company/)、[API 平台前史](https://pangea.cloud/blog/introducing-security-platform-as-a-service/)、[融资回顾](https://pangea.cloud/blog/redefining-security-in-2023-and-beyond/)、[AI Guard / Prompt Guard 发布](https://pangea.cloud/blog/pangea-unveils-suite-of-ai-security-guardrails-and-jailbreak-competition/)、[SEC 第 12 注](https://www.sec.gov/Archives/edgar/data/1535527/000153552726000010/crwd-20260131.htm)、[Falcon AIDR GA](https://www.crowdstrike.com/en-us/press-releases/crowdstrike-announces-general-availability-of-falcon-ai-detection-and-response/)。

这些价格**不能直接相互排序或计算“投资回报倍数”**：净现金、总购买对价、现金/股票和替代股权奖励不是同一口径；分红、股权稀释、创始人持股与交易结构没有在本报告中审计。本文只用交易证明归属与平台路线发生变化。

### 7.2 独立成长与规模：更有用的读法

融资从种子到成长差异很大：Pillar 的已核 seed $9M、Tenzai 的 seed $75M、Noma/HiddenLayer 的 B 轮 $100M、XBOW 两次 C 轮披露 $155M、Horizon3 的 E 轮 $250M。**轮次标签与金额也不是员工、收入或市场份额**；不同团队的创业前史、客户基础和投资者预期不同。

本轮的较新成长节点包括 2026 年 WitnessAI、Zenity、Mindgard、HiddenLayer、Lasso、XBOW、Horizon3 和 Aikido 的融资/发布；中国的 GenTel 2026 战略描述与 RealAI 媒体融资线索已分别标为计划/二手。公开规模例子只取有日期的公司披露：XBOW 2026-05 的 >100 客户、>250 员工；Horizon3 2026-08 的 >7,000 organizations、>310,000 production tests；Dropzone 2026-01 对 2025 的 300+ production deployments。它们分母不同，不能排列成一个采用规模榜单。对应原稿见第 4 节。

把未来计划剔出实绩同样重要：Torq 旧稿设定的 2026 ARR 目标、厂商计划新增员工或安全 finetuning、收购后的平台整合时间，都只在有新完成证据时才转为已实现。

融资金额说明资本供给，不能直接说明营收、客户留存、产品安全性或研发壁垒。公开客户 logo 表明合作关系的某种存在，通常不能确认付费规模、生产接入深度和合同续约。创始人经历能解释产品切入点，不能替代技术和商业证据。

比较“规模”时，本档案使用**可核验融资阶段、公开金额和组织状态**，只在有明确披露时记录员工或客户数据。没有统一日期、统一统计口径的员工数，不拿来排队；未披露 ARR、收入、毛利、推理成本和留存的公司，标为未知。宣传中的“自主”同样需要细问：是自动建议、自动查询、自动结案，还是能够改变生产状态？

**分析判断：** 点能力被平台收购，说明已有安全平台愿意购买相关技术、人才或进入市场的速度。这并不自动证明每一种点产品都没有独立生存空间。独立公司的优势可能来自更好的集成、更深的领域评测、独有数据或直接嵌入开发流程；平台的优势则来自分发、已有控制点和采购关系。哪个因素最重要，必须具体到部署场景验证。

## 8. 对科研、职业与创业的参考

### 8.1 更适合继续追问的研究问题

下表是从产品控制点和证据缺口导出的**候选问题**，没有做完整的新颖性审查，也不把它们称作无人研究的空白。

| 候选问题 | 为什么与行业需求相连 | 更有说服力的研究产物 | 首要取舍 |
| --- | --- | --- | --- |
| 任务约束到可执行授权 | NHI 图能说明权限，业务授权还需要“为什么、何时、为谁” | 从用户任务生成可审计策略，测量合法任务效用、越权阻断与策略维护成本 | 自动策略自身可能误解任务；最终授权不能只依赖另一个不受约束的 LLM |
| 跨 agent 委托与责任链 | 多 agent、共享工具、短时凭证改变身份生命周期 | 带 provenance 的委托协议、撤销、最小权限衰减、攻击下的可追溯执行 | 完整中介与跨 SaaS/本地工具覆盖较难 |
| 语义检测与硬约束组合 | classifier/judge 能理解上下文，执行策略提供确定边界 | 与单 detector、单策略基线比较，测 adaptive attacks、延迟、任务完成率 | 多一层 judge 增加成本，也可能被输入诱导 |
| 安全调查 agent 的证据纪律 | SOC 输入常可被攻击者污染且可能缺失 | 查询证据绑定、未知传播、结案可验证性、攻击日志回放 | “没有查到”与“确实不存在”需要不同语义 |
| 发现—验证—修复闭环 | B1 容易秀发现数，客户更关心真实暴露是否减少 | 保留 PoC、补丁测试、去重和人工接受记录的端到端 benchmark | 真实目标授权、披露流程和工程成本限制规模 |
| 私有环境中的能力与成本 | AI 安全厂商越来越强调本地部署，客户数据未必可出域 | 在相同任务与预算下比较本地/托管、上下文裁剪、策略覆盖 | 不能只拿总成功率掩盖单位任务成本、长尾失败和部署限制 |

对已有 agent 安全研究基础的读者，较有信息增量的一步是：选一个真实工作流，把 **资产 → 身份 → 信息来源 → 工具调用 → 可见副作用 → 审计证据** 串起来，找到当前论文与产品都难以清楚回答的边界。先证明这个问题能被可靠测量，再决定做检测、策略、协议还是执行平台。

### 8.2 职业选择：按工作内容辨别公司

- **研究型评测/红队团队**：更重攻击构造、模型行为和评测框架。关注开源/论文是否是公司持续投入，而非创始人的历史论文；询问能否公开研究与如何处理负结果。
- **agent 运行时/身份团队**：更重系统、SDK/代理、IAM、分布式权限与企业连接器。安全保证需要工程覆盖，适合同时理解 agent 和传统安全基础设施的人。
- **漏洞发现/修复团队**：需要程序分析、fuzzing、Web/业务逻辑、调试与验证工程。通用模型能力进步很快，团队价值更多取决于环境与结果验证。
- **SOC agent 团队**：更重调查知识、数据管道、连接器、可靠性和客户现场。推理研究与安全运营实践必须对接，产品岗位通常也会涉及权限和人工升级设计。

这些是工作类型分析，不是对具体职位空缺的核验或就业推荐。选择已经被收购的团队时，需重新核对其研究发表、岗位地点和产品路线是否延续。

### 8.3 创业判断：能付费的切口需要多一层证据

从产品说明走到创业判断，至少要回答：谁承担损失、谁有预算、现有产品为何接不住、结果如何验收、数据和执行权限从何而来。对博士生而言，**论文里的攻击成功率改善**与**客户愿意接入生产的控制点**可能是不同交付物。

可先用四类探索来验证需求，而不是先造一个“AI 安全平台”：

1. 一个具体 agent 工作流的完整授权/外发控制，验证接入成本和业务例外。
2. 一个垂直域的安全评测及回归体系，验证错误是否重复发生、是否有上线门禁预算。
3. 一类能稳定重现并修复的漏洞，验证原始证据质量和开发者接受率。
4. 一类高频 SOC 调查，验证证据链、人工重开和推理/连接器成本。

这些是下一步问题，不是已经证明的机会。通用 detector 和“接 LLM 的聊天界面”容易面对原生平台能力；专门的执行约束、验证环境和客户流程可能更难被替代，但同样需要证明覆盖和交付成本。

## 9. 如何使用和继续更新这份资料

[交互图谱](investigation-ai-security-startups-latest.html)支持多维筛选、公司对照与场景推演；执行隔离的机制详见[Agent Sandboxing 档案](../investigation-agent-sandboxing/investigation-agent-sandboxing-latest.md)。

**证据约定：** “官方披露”指团队、融资和交易声明；“产品文档/代码”证明公开接口或机制存在，不证明所有宣传效果；“厂商实验/客户自述”保留原条件，不当作独立评测；“分析”是本档案据控制点作出的推断；“未知”是本次未找到足够资料。商业实现大多闭源，本报告不能核实训练数据、完整内部架构和全部部署能力。

**检索范围：** 本轮在 2026-10-11 检索公司及收购方官网、产品资料、投资者/监管披露、原始论文与作者代码，并为重要主体检查较新的融资和并购。新闻稿转载只有在发布者明确为公司或投资方时，才作为一手自述使用；搜索摘要和商业数据库用来发现线索，不用于填造未核实总额。公开渠道有可见性偏差，本轮尤其不能据英文信息密度推断中国市场规模。

**持续保留的未知项：** 多数公司的真实 ARR/留存、推理毛利、客户生产覆盖率、失败分布、人员组成比例和内部实现细节；已被收购产品的长期独立品牌与路线；中国部分公司的精确融资金额与最新组织规模。它们会直接影响创业和职业判断，应在下一步通过产品试用、客户访谈或正式尽调补证。

**建议后续深挖顺序：** 先选一个控制点，用相同威胁模型比较两三家产品的公开能力；再选择一个可复现的开源/论文基线；最后建立能同时衡量安全、合法任务效用、成本和接入覆盖的实验。融资日期和并购状态可以逐项更新，技术结论则需要重新核验其依赖条件。

本版为首次整理。后续优先更新交易状态、当前产品归属与可复现的技术证据，保留历史版本以便比较。
