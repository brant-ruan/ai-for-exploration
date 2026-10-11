import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateDate } from './archive-lib.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const options = {};
for (let index = 0; index < args.length; index += 2) {
  const key = args[index]?.replace(/^--/, '');
  if (!['slug', 'file', 'updated'].includes(key) || !args[index + 1] || options[key]) throw new Error('Usage: npm run sync:interactive -- [--slug TOPIC] [--file DRAFT.html] [--updated YYYY-MM-DD]');
  options[key] = args[index + 1];
}
if ((options.file || options.updated) && !options.slug) throw new Error('--file and --updated require --slug');
const { site, topics } = JSON.parse(await readFile(path.join(root, 'site/catalog.json'), 'utf8'));
const selected = options.slug ? topics.filter((topic) => topic.slug === options.slug) : topics;
if (!selected.length) throw new Error('Unknown topic: ' + options.slug);
const css = await readFile(path.join(root, 'templates/interactive/base.css'), 'utf8');
const favicon = (await readFile(path.join(root, 'site/assets/favicon.svg'), 'utf8')).trim();
const faviconUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(favicon);
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
function block(document, key, content, insert) {
  const start = `<!-- archive:${key}:start -->`;
  const end = `<!-- archive:${key}:end -->`;
  const replacement = `${start}\n${content}\n${end}`;
  const starts = document.split(start).length - 1;
  const ends = document.split(end).length - 1;
  if (starts === 1 && ends === 1 && document.indexOf(start) < document.indexOf(end)) {
    return document.slice(0, document.indexOf(start)) + replacement + document.slice(document.indexOf(end) + end.length);
  }
  if (starts || ends) throw new Error(`Malformed/duplicate archive:${key} markers`);
  return insert(document, replacement);
}
for (const topic of selected) {
  const file = options.file ? path.resolve(root, options.file) : path.join(root, topic.slug, topic.html);
  if (options.file && file !== path.join(root, topic.slug, topic.html) && !file.startsWith(path.join(root, 'work') + path.sep)) throw new Error('--file must be a work/ draft or the topic latest HTML');
  const updated = validateDate(options.updated ?? topic.updated);
  if (updated < topic.created) throw new Error('Update must not predate creation');
  const original = await readFile(file, 'utf8');
  if (!/<main\b[^>]*\bid="content"/.test(original)) throw new Error('Interactive HTML needs <main id="content"> for shared navigation');
  const header = `<a class="skip archive-skip" href="#content">跳到正文</a><header class="archive-header"><div class="archive-header-inner"><a class="archive-brand" href="../"><span>探索档案<small>ai-for-exploration</small></span></a><nav class="archive-nav" aria-label="档案导航"><a href="../#topics">主题档案</a><a href="./report/">深度报告（最新）</a><a href="${escape(site.repository)}">GitHub ↗</a></nav></div></header>`;
  const footer = `<footer class="archive-footer"><div class="archive-footer-inner"><div><strong>ai-for-exploration</strong><span class="archive-meta">创建 ${escape(topic.created)} · 内容更新 ${escape(updated)}</span></div><a href="${escape(site.repository + '/tree/main/' + topic.slug)}">源文件与版本记录 ↗</a></div></footer>`;
  let result = block(original, 'style', `<style data-archive-style>\n${css.trimEnd()}\n</style>`, (document, content) => {
    if (!/<\/head>/i.test(document)) throw new Error('Missing HTML head');
    return document.replace(/<\/head>/i, `${content}\n</head>`);
  });
  result = block(result, 'icon', `<link data-archive-icon rel="icon" type="image/svg+xml" sizes="any" href="${escape(faviconUri)}">`, (document, content) => {
    if (!/<\/head>/i.test(document)) throw new Error('Missing HTML head');
    return document.replace(/<\/head>/i, `${content}\n</head>`);
  });
  result = block(result, 'header', header, (document, content) => {
    if (!/<body\b[^>]*>/i.test(document)) throw new Error('Missing HTML body');
    return document.replace(/<body\b[^>]*>/i, (tag) => `${tag}\n${content}\n`);
  });
  result = block(result, 'footer', footer, (document, content) => {
    if (!/<\/main>\s*<\/div>/i.test(document)) throw new Error('Expected .layout wrapper after main');
    return document.replace(/<\/main>\s*<\/div>/i, (tags) => `${tags}\n${content}\n`);
  });
  const metadata = `<div class="archive-meta"><span>创建 <time datetime="${escape(topic.created)}">${escape(topic.created)}</time></span><span>内容更新 <time datetime="${escape(updated)}">${escape(updated)}</time></span></div>`;
  result = block(result, 'meta', metadata, (document, content) => {
    const hero = /(<header\b[^>]*class="hero"[^>]*>[\s\S]*?)(<\/header>)/i;
    if (!hero.test(document)) throw new Error('Interactive HTML needs header.hero');
    return document.replace(hero, (_, body, close) => `${body}\n${content}\n${close}`);
  });
  if (result !== original) await writeFile(file, result);
  console.log(`Synchronized shared style/icon/navigation: ${path.relative(root, file)}`);
}
