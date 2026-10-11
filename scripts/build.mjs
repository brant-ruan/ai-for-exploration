import { readFile, writeFile, mkdir, rm, cp, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { validateDate } from './archive-lib.mjs';
import { headerCss, footerCss, renderHeader, renderFooter } from './site-chrome.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const { site, topics } = JSON.parse(await readFile(path.join(root, 'site/catalog.json'), 'utf8'));
const base = (process.env.BASE_PATH ?? site.basePath).replace(/\/$/, '');
if (base && !/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+$/.test(base)) {
  throw new Error('BASE_PATH must be empty or a URL path such as /ai-for-exploration');
}
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const url = (file = '') => `${base}/${file}`;
const kindLabel = (kind) => kind === 'investigation' ? '广度调研' : '深度探索';
const dateLabel = (date) => date.replaceAll('-', '.');
const sorted = [...topics].sort((a, b) => b.updated.localeCompare(a.updated));
const slugSet = new Set();

for (const topic of topics) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug) || slugSet.has(topic.slug)) {
    throw new Error(`Invalid or duplicate topic slug: ${topic.slug}`);
  }
  slugSet.add(topic.slug);
  if (!['investigation', 'exploration'].includes(topic.kind)) throw new Error(`Invalid kind: ${topic.kind}`);
  for (const date of [topic.created, topic.updated]) {
    validateDate(date);
  }
  if (topic.updated < topic.created) throw new Error(`Update before creation: ${topic.slug}`);
  for (const key of ['title', 'subtitle', 'summary', 'markdown', 'html']) {
    if (!topic[key] || typeof topic[key] !== 'string') throw new Error(`Missing ${key} for ${topic.slug}`);
  }
  if (topic.markdown !== `${topic.slug}-latest.md` || topic.html !== `${topic.slug}-latest.html`) throw new Error(`Current files must use -latest: ${topic.slug}`);
  const versions = new Set();
  for (const version of topic.history ?? []) {
    validateDate(version.date);
    if (!/^\d{8}(?:-(?:[2-9]|[1-9]\d+))?$/.test(version.version) || versions.has(version.version) || version.version.split('-')[0] !== version.date.replaceAll('-', '')) throw new Error(`Invalid historical version: ${topic.slug}/${version.version}`);
    if (version.date < topic.created || version.date > topic.updated) throw new Error(`Historical date outside topic range: ${topic.slug}`);
    if (version.markdown !== `${topic.slug}-${version.version}.md` || version.html !== `${topic.slug}-${version.version}.html`) throw new Error(`Invalid historical filenames: ${topic.slug}`);
    versions.add(version.version);
  }
  const publicFiles = [topic.markdown, topic.html, ...(topic.assets ?? []), ...(topic.history ?? []).flatMap((version) => [version.markdown, version.html, ...(version.assets ?? [])])];
  for (const file of publicFiles) {
    if (path.isAbsolute(file) || file.split(/[\\/]/).includes('..')) throw new Error(`Invalid topic file: ${file}`);
    await stat(path.join(root, topic.slug, file));
  }
  for (const extension of ['markdown', 'html']) {
    const aliases = topic.aliases?.[extension] ?? [];
    if (new Set(aliases).size !== aliases.length) throw new Error(`Duplicate compatibility aliases: ${topic.slug}`);
    for (const alias of aliases) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(md|html)$/.test(alias) || !alias.endsWith(extension === 'html' ? '.html' : '.md') || publicFiles.includes(alias)) throw new Error(`Invalid compatibility alias: ${alias}`);
    }
  }
}

const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const book = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4.5h7a3 3 0 0 1 3 3V20a4 4 0 0 0-4-2H4zm16 0h-3a3 3 0 0 0-3 3V20a4 4 0 0 1 4-2h2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
function header(isHome = false) {
  return renderHeader({ homeHref: url(), topicsHref: isHome ? '#topics' : url('#topics'), contentHref: '#main', repository: site.repository });
}
const footer = renderFooter({ repository: site.repository });
function shell({ title, description, body, route = '', className = '' }) {
  return `<!doctype html>
<html lang="zh-CN"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="#172f44">
  <title>${escape(title)}</title>
  <link rel="canonical" href="${escape(site.url + url(route))}">
  <link rel="icon" type="image/svg+xml" href="${url('assets/favicon.svg')}">
  <link rel="stylesheet" href="${url('assets/site.css')}">
  <script src="${url('assets/site.js')}" defer></script>
</head><body class="${className}">${body}</body></html>`;
}
function historyMenu(topic) {
  if (!topic.history?.length) return '';
  const entries = [...topic.history].reverse().map((version) => `<li><time datetime="${version.date}">${dateLabel(version.date)}</time>${version.version.includes('-') ? ` · ${escape(version.version)}` : ''}<a href="${url(`${topic.slug}/${version.html}`)}">交互讲解</a><a href="${url(`${topic.slug}/${version.markdown}`)}" download>Markdown</a><small>替换说明：${escape(version.summary)}</small></li>`).join('');
  return `<details class="report-history"><summary>历史版本 · ${topic.history.length}</summary><ul>${entries}</ul></details>`;
}
function card(topic) {
  const reportUrl = url(`${topic.slug}/report/`);
  const htmlUrl = url(`${topic.slug}/${topic.html}`);
  const terms = [topic.title, topic.subtitle, topic.summary, ...topic.tags].join(' ');
  return `<article class="topic-card" data-search="${escape(terms)}" data-kind="${topic.kind}">
    <div class="topic-title-row"><h3><a href="${reportUrl}">${escape(topic.title)}</a></h3></div>
    <div class="topic-actions"><a class="button button-primary" href="${htmlUrl}">交互讲解 ${arrow}</a><a class="button button-secondary" href="${reportUrl}">${book} 深度报告</a></div>
    <div class="topic-meta"><span>创建 <time datetime="${topic.created}">${dateLabel(topic.created)}</time></span><span>更新 <time datetime="${topic.updated}">${dateLabel(topic.updated)}</time></span></div>
    <p class="topic-summary">${escape(topic.summary)}</p>
  </article>`;
}
const kinds = [...new Set(topics.map((topic) => topic.kind))];
const filters = kinds.length > 1 ? `<div class="topic-filters" aria-label="按探索类型筛选"><button type="button" data-kind-filter="all" aria-pressed="true">全部</button>${kinds.map((kind) => `<button type="button" data-kind-filter="${kind}" aria-pressed="false">${kindLabel(kind)}</button>`).join('')}</div>` : '';
const aiPresence = `<span class="ai-presence" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" focusable="false"><defs><radialGradient id="ai-presence-glow"><stop stop-color="#92c4d4" stop-opacity="0"/><stop offset=".64" stop-color="#92c4d4" stop-opacity=".65"/><stop offset="1" stop-color="#92c4d4" stop-opacity="0"/></radialGradient><linearGradient id="ai-presence-shell" x1="20" y1="18" x2="44" y2="46" gradientUnits="userSpaceOnUse"><stop stop-color="#f3fbfe"/><stop offset="1" stop-color="#c3deea"/></linearGradient></defs><circle class="ai-presence-halo" cx="32" cy="32" r="27" fill="url(#ai-presence-glow)"/><g class="ai-presence-orbit" stroke="#537f98" stroke-width="1.15"><path d="M14 14a25.5 25.5 0 0 1 36 0M50 50a25.5 25.5 0 0 1-36 0"/><path d="M6.5 27v10M57.5 27v10" stroke-opacity=".65"/></g><g class="ai-presence-core"><rect x="17" y="18" width="30" height="28" rx="11" fill="url(#ai-presence-shell)" stroke="#557b93" stroke-width="1.25"/><rect x="25" y="28" width="3" height="6" rx="1.5" fill="#2e5e79"/><rect x="36" y="28" width="3" height="6" rx="1.5" fill="#2e5e79"/><path d="M28.5 38.5q3.5 2 7 0" stroke="#4d7d98" stroke-width="1.25" stroke-linecap="round"/></g><circle class="ai-presence-signal" cx="32" cy="6.5" r="2.6" fill="#397c96"/><circle cx="32" cy="57.5" r="1.8" fill="#779faf"/></svg></span>`;
const home = shell({
  title: `${site.title} · AI for Exploration`, description: site.description, className: 'home-page',
  body: `${header(true)}<main id="main" class="home-main">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span></span> AI FOR EXPLORATION</p><h1 id="hero-title"><span class="hero-title-line">借助 AI${aiPresence}</span><span class="hero-title-line">持续探索与积累</span></h1><p class="hero-description">记录人工智能辅助知识管理与探索的尝试<br>从一个话题的广度调研，到一个问题的深度追问</p><a class="text-link" href="#topics">浏览主题档案 ${arrow}</a></div>
    <aside class="reading-modes" aria-label="两种阅读方式"><p class="mode-caption">同一个主题，两条理解路径</p><div class="mode-row"><span class="mode-number">01</span><div><h2>深度记录 <small>MARKDOWN</small></h2><p>细读机制、比较取舍，追溯事实与来源。</p></div></div><div class="mode-row"><span class="mode-number">02</span><div><h2>交互讲解 <small>HTML</small></h2><p>通过图示、案例与交互，建立技术全貌。</p></div></div><p class="mode-footnote">独立组织，共用经过核验的证据。</p></aside></section>
    <section id="topics" class="archive" aria-labelledby="archive-title"><div class="section-top"><div><p class="eyebrow">THE ARCHIVE</p><h2 id="archive-title">主题档案</h2></div><div class="archive-tools">${filters}<label class="search-field"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span class="sr-only">搜索主题、关键词或标签</span><input id="topic-search" type="search" placeholder="搜索主题、关键词或标签" autocomplete="off"></label></div></div><div class="topic-list">${sorted.map(card).join('')}</div><p id="search-status" class="sr-only" role="status" aria-live="polite"></p><div id="empty-state" class="empty-state" hidden><p>没有匹配的主题</p><span>试试其他关键词，或清空搜索。</span><button id="clear-search" type="button" class="button button-secondary">清空筛选</button></div></section>
  </main>${footer}`
});

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'site/assets'), path.join(output, 'assets'), { recursive: true });
await writeFile(path.join(output, 'assets/site.css'), `${(await readFile(path.join(root, 'site/assets/site.css'), 'utf8')).trimEnd()}\n\n${headerCss}\n\n${footerCss}\n`);
await writeFile(path.join(output, 'index.html'), home);
await writeFile(path.join(output, '.nojekyll'), '');
try {
  await cp(path.join(root, 'CNAME'), path.join(output, 'CNAME'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}


for (const topic of topics) {
  const topicDir = path.join(root, topic.slug);
  const source = await readFile(path.join(topicDir, topic.markdown), 'utf8');
  const md = new MarkdownIt({ html: false, linkify: true });
  const tokens = md.parse(source, {});
  // Relative media/links are authored beside the source Markdown, while its
  // generated reader lives in report/. Resolve from the source location.
  const sourceUrl = new URL(url(`${topic.slug}/${topic.markdown}`), 'https://archive.invalid');
  function resolveReferences(items) {
    for (const token of items) {
      const attribute = token.type === 'image' ? 'src' : token.type === 'link_open' ? 'href' : null;
      const reference = attribute && token.attrGet(attribute);
      if (reference && !/^(?:#|\/|[a-z][a-z0-9+.-]*:)/i.test(reference)) {
        const resolved = new URL(reference, sourceUrl);
        token.attrSet(attribute, resolved.pathname + resolved.search + resolved.hash);
      }
      if (token.children) resolveReferences(token.children);
    }
  }
  resolveReferences(tokens);
  const headings = [];
  // Fixed IDs in the reader shell must remain distinct from heading IDs.
  const used = new Set(['main', 'report-content']);
  let reportTitle = topic.title;
  // Keep the source untouched; its first H1 becomes the reader's page title.
  const titleIndex = tokens.findIndex((token) => token.type === 'heading_open' && token.tag === 'h1');
  if (titleIndex >= 0) {
    reportTitle = tokens[titleIndex + 1].content;
    tokens.splice(titleIndex, 3);
  }
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'heading_open') continue;
    const title = tokens[i + 1].content;
    const stem = title.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
    let id = stem;
    let suffix = 2;
    while (used.has(id)) id = `${stem}-${suffix++}`;
    used.add(id);
    tokens[i].attrSet('id', id);
    if (tokens[i].tag === 'h2' || tokens[i].tag === 'h3') headings.push({ id, title, level: Number(tokens[i].tag[1]) });
  }
  const defaultHeadingClose = md.renderer.rules.heading_close ?? ((tokens, index, options, env, self) => self.renderToken(tokens, index, options));
  md.renderer.rules.heading_close = (tokens, index, options, env, self) => {
    const open = tokens[index - 2];
    const id = open?.attrGet('id');
    return `${id ? `<a class="heading-anchor" href="#${escape(id)}" aria-label="此章节的永久链接">#</a>` : ''}${defaultHeadingClose(tokens, index, options, env, self)}`;
  };
  md.renderer.rules.table_open = () => '<div class="table-scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表"><table>\n';
  md.renderer.rules.table_close = () => '</table></div>\n';
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, index, options, env, self) => `<div class="code-block"><div class="code-toolbar"><span>${escape(tokens[index].info.trim().split(/\s+/)[0] || 'text')}</span><button class="copy-code" type="button">复制</button></div>${defaultFence(tokens, index, options, env, self)}</div>`;
  const content = md.renderer.render(tokens, md.options, {});
  const groups = [];
  for (const heading of headings) {
    if (heading.level === 2 || !groups.length) groups.push({ ...heading, children: [] });
    else groups.at(-1).children.push(heading);
  }
  const toc = groups.map((group) => `<li class="toc-group"><a href="#${escape(group.id)}" data-toc-id="${escape(group.id)}">${escape(group.title)}</a>${group.children.length ? `<details class="toc-children"><summary>展开小节<span class="sr-only">：${escape(group.title)}</span></summary><ol>${group.children.map((child) => `<li><a href="#${escape(child.id)}" data-toc-id="${escape(child.id)}">${escape(child.title)}</a></li>`).join('')}</ol></details>` : ''}</li>`).join('');
  const report = shell({
    title: `${topic.title} · 深度报告 · ${site.title}`, description: topic.summary, route: `${topic.slug}/report/`, className: 'report-page',
    body: `${header()}<div class="reading-progress" aria-hidden="true"><span></span></div><main id="main" class="reader-main">
      <section class="report-hero"><nav class="breadcrumb" aria-label="当前位置"><a href="${url('#topics')}">主题档案</a><span>/</span><span>${escape(topic.title)}</span></nav><p class="eyebrow">${kindLabel(topic.kind)} <span class="eyebrow-separator">/</span> 深度报告 <span class="eyebrow-separator">/</span> 创建 <time datetime="${topic.created}">${dateLabel(topic.created)}</time> <span class="eyebrow-separator">/</span> 更新 <time datetime="${topic.updated}">${dateLabel(topic.updated)}</time></p><h1>${escape(reportTitle)}</h1><p class="report-description">${escape(topic.summary)}</p><div class="report-actions"><a class="button button-primary" href="${url(`${topic.slug}/${topic.html}`)}">打开交互讲解 ${arrow}</a><a class="button button-secondary" href="${url(`${topic.slug}/${topic.markdown}`)}" download>${book} 下载 Markdown</a><button class="button print-button" type="button" data-print>打印 / PDF</button></div>${historyMenu(topic)}</section>
      <div class="reader-grid"><aside class="reader-toc"><details class="toc-shell" open><summary>本页目录<span class="toc-toggle" aria-hidden="true">⌄</span></summary><nav aria-label="报告章节"><ol>${toc}</ol></nav></details><div class="toc-note">这是一份带时间范围的资料快照。版本与出处见正文及来源索引。</div></aside><article id="report-content" class="prose" aria-label="${escape(topic.title)}报告正文">${content}<div class="report-end"><span>读到这里，可以换一条理解路径。</span><a class="text-link" href="${url(`${topic.slug}/${topic.html}`)}">打开交互讲解 ${arrow}</a></div></article></div>
    </main><a class="back-top" href="#main" aria-label="回到页面顶部" hidden>↑</a>${footer}`
  });
  await mkdir(path.join(output, topic.slug, 'report'), { recursive: true });
  await writeFile(path.join(output, topic.slug, 'report/index.html'), report);
  for (const file of new Set([topic.markdown, topic.html, ...(topic.assets ?? []), ...(topic.history ?? []).flatMap((version) => [version.markdown, version.html, ...(version.assets ?? [])])])) {
    const destination = path.join(output, topic.slug, file);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(topicDir, file), destination, { recursive: true });
  }
  for (const alias of topic.aliases?.markdown ?? []) {
    await writeFile(path.join(output, topic.slug, alias), source);
  }
  for (const alias of topic.aliases?.html ?? []) {
    const destination = `./${topic.html}`;
    const redirect = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${escape(destination)}"><title>转到最新交互讲解</title></head><body><a href="${escape(destination)}">打开最新交互讲解</a><script>location.replace(${JSON.stringify(destination)} + location.search + location.hash)</script></body></html>`;
    await writeFile(path.join(output, topic.slug, alias), redirect);
  }
  console.log(`Built ${topic.slug}: latest HTML + Markdown reader (${headings.length} headings), ${(topic.history ?? []).length} historical version(s)`);
}

await writeFile(path.join(output, '404.html'), shell({
  title: `未找到页面 · ${site.title}`, description: '返回主题档案，继续探索。', route: '404.html',
  body: `${header()}<main id="main" class="not-found"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>这条路径暂时没有资料。</h1><p>页面可能已移动，请从主题档案继续阅读。</p><a class="button button-primary" href="${url()}">返回主题档案 ${arrow}</a></main>${footer}`
}));
console.log(`Site ready: dist/ · base path ${base || '/'} · ${topics.length} topic(s)`);
