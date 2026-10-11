import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { replaceReadmeIndex } from './archive-lib.mjs';
import { headerCss, footerCss, renderHeader, renderFooter } from './site-chrome.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const { site, topics } = JSON.parse(await readFile(path.join(root, 'site/catalog.json'), 'utf8'));
const base = (process.env.BASE_PATH ?? site.basePath).replace(/\/$/, '');
const origin = 'https://local.invalid';
const failures = [];
const checksum = (data) => createHash('sha256').update(data).digest('hex');
const readme = await readFile(path.join(root, 'README.md'), 'utf8');
if (readme !== replaceReadmeIndex(readme, site, topics)) failures.push('README index differs from catalog; run npm run sync:index');
const sharedCss = `${(await readFile(path.join(root, 'templates/interactive/base.css'), 'utf8')).trimEnd()}\n\n${headerCss}\n\n${footerCss}`;
const sharedNavigation = (await readFile(path.join(root, 'templates/interactive/navigation.js'), 'utf8')).trimEnd();
const favicon = (await readFile(path.join(root, 'site/assets/favicon.svg'), 'utf8')).trim();
const faviconUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(favicon);
const cname = await readFile(path.join(root, 'CNAME'), 'utf8').catch((error) => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
if (cname !== null) {
  if (cname.trim() !== new URL(site.url).hostname) failures.push('CNAME differs from catalog site hostname');
  if ((await readFile(path.join(output, 'CNAME'), 'utf8')) !== cname) failures.push('Published CNAME differs from source');
}
const htmlFiles = [];
const cssFiles = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) await walk(path.join(dir, entry.name));
    else if (entry.name.endsWith('.html')) htmlFiles.push(path.join(dir, entry.name));
    else if (entry.name.endsWith('.css')) cssFiles.push(path.join(dir, entry.name));
  }
}
function decodeEntities(value) {
  return value.replace(/&(?:#x([0-9a-f]+)|#([0-9]+)|(amp|quot|apos|lt|gt));/gi, (_, hex, decimal, named) => {
    if (named) return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[named.toLowerCase()];
    const code = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '\ufffd';
  });
}
function cssUrls(css) {
  const urls = [];
  // Consume comments and other strings whole, so their literal "url(...)" text
  // is not treated as a resource. URL arguments may use CSS escapes.
  const pattern = /\/\*[\s\S]*?\*\/|(?<![\w-])url\s*\(\s*(?:"((?:\\[\s\S]|[^"\\])*)"|'((?:\\[\s\S]|[^'\\])*)'|((?:\\[\s\S]|[^)\\])*?))\s*\)|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/gi;
  for (const match of css.matchAll(pattern)) {
    const argument = match[1] ?? match[2] ?? match[3];
    if (argument === undefined) continue;
    const value = argument.trim().replace(/\\([0-9a-f]{1,6})(?:\r\n|[\t\n\f\r ])?|\\(?:\r\n|[\n\r\f])|\\([\s\S])/gi, (_, hex, escaped) => {
      if (!hex) return escaped ?? '';
      const code = Number.parseInt(hex, 16);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '\ufffd';
    });
    // Fragment-only CSS URLs address SVG definitions, not separate asset files.
    if (value && !value.startsWith('#')) urls.push(value);
  }
  return urls;
}
function srcsetUrls(srcset) {
  const urls = [];
  const space = /[\t\n\f\r ]/;
  let position = 0;
  while (position < srcset.length) {
    while (position < srcset.length && (space.test(srcset[position]) || srcset[position] === ',')) position++;
    const start = position;
    while (position < srcset.length && !space.test(srcset[position])) position++;
    let value = srcset.slice(start, position);
    if (!value) break;
    // A URL token includes internal commas (including data URLs). Only trailing
    // commas terminate a candidate; commas after descriptors separate candidates.
    if (value.endsWith(',')) {
      value = value.replace(/,+$/, '');
      if (value) urls.push(value);
      continue;
    }
    urls.push(value);
    let parentheses = 0;
    while (position < srcset.length) {
      const character = srcset[position++];
      if (character === '(') parentheses++;
      else if (character === ')') parentheses = Math.max(0, parentheses - 1);
      else if (character === ',' && !parentheses) break;
    }
  }
  return urls;
}
function inspectHtml(html) {
  const ids = [];
  const references = [];
  const icons = [];
  const classes = [];
  // Ignore comments and raw-text bodies such as script/textarea. Inspect their
  // opening attributes; inspect style bodies separately as CSS.
  const tags = /<!--[\s\S]*?-->|<(script|style|textarea|title)\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\s\S]*?)<\/\1\s*>|<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
  for (const tag of html.matchAll(tags)) {
    const name = (tag[1] ?? tag[4])?.toLowerCase();
    if (!name) continue;
    const attributes = new Map();
    for (const attribute of (tag[2] ?? tag[5]).matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>\x60]+)))?/g)) {
      const key = attribute[1].toLowerCase();
      if (!attributes.has(key)) attributes.set(key, decodeEntities(attribute[2] ?? attribute[3] ?? attribute[4] ?? ''));
    }
    if (attributes.has('id')) ids.push(attributes.get('id'));
    if (attributes.has('class')) classes.push(...attributes.get('class').split(/\s+/).filter(Boolean));
    if (name === 'link' && (attributes.get('rel') ?? '').toLowerCase().split(/\s+/).includes('icon')) {
      icons.push({ href: attributes.get('href'), type: attributes.get('type'), sizes: attributes.get('sizes') });
    }
    for (const key of ['href', 'src', 'xlink:href']) if (attributes.has(key)) references.push(attributes.get(key));
    if (attributes.has('srcset')) references.push(...srcsetUrls(attributes.get('srcset')));
    if (attributes.has('style')) references.push(...cssUrls(attributes.get('style')));
    if (name === 'style') references.push(...cssUrls(tag[3] ?? ''));
  }
  return { ids, references, icons, classes };
}
function elementBodyByClass(html, name, className) {
  const elements = new RegExp(`<${name}\\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\\s\\S]*?)<\\/${name}\\s*>`, 'gi');
  for (const element of (html ?? '').matchAll(elements)) {
    const classAttribute = element[1].match(/(?:^|\s)class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const tokens = decodeEntities(classAttribute?.[1] ?? classAttribute?.[2] ?? classAttribute?.[3] ?? '').split(/\s+/);
    if (tokens.includes(className)) return element[2];
  }
  return '';
}
await walk(output);
const documents = new Map();
const inspected = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  documents.set(file, html);
  inspected.set(file, inspectHtml(html));
}
let checked = 0;
async function checkReference(file, value) {
  if (/^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(value)) return;
  const label = path.relative(output, file);
  const pageUrl = new URL(base + '/' + label.split(path.sep).join('/'), origin);
  let resolved;
  let pathname;
  try {
    resolved = new URL(value, pageUrl);
    if (resolved.origin !== origin) return;
    pathname = decodeURIComponent(resolved.pathname);
  } catch {
    failures.push(label + ': invalid local URL (' + value + ')'); return;
  }
  if (base && !pathname.startsWith(base + '/')) {
    failures.push(label + ': outside base path (' + value + ')'); return;
  }
  let target = path.resolve(output, pathname.slice(base.length).replace(/^\//, ''));
  if (target !== output && !target.startsWith(output + path.sep)) {
    failures.push(label + ': invalid local path (' + value + ')'); return;
  }
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    await stat(target);
    if (resolved.hash && target.endsWith('.html')) {
      const targetIds = inspected.get(target)?.ids ?? inspectHtml(await readFile(target, 'utf8')).ids;
      const id = decodeURIComponent(resolved.hash.slice(1));
      if (!targetIds.includes(id)) failures.push(label + ': missing anchor (' + value + ')');
    }
    checked++;
  } catch {
    failures.push(label + ': missing local file (' + value + ')');
  }
}
for (const [file, { ids, references }] of inspected) {
  if (new Set(ids).size !== ids.length) failures.push(path.relative(output, file) + ': duplicate HTML IDs');
  for (const value of references) await checkReference(file, value);
}
for (const file of cssFiles) {
  for (const value of cssUrls(await readFile(file, 'utf8'))) await checkReference(file, value);
}
for (const name of ['index.html', '404.html']) {
  const page = documents.get(path.join(output, name));
  const header = renderHeader({ homeHref: `${base}/`, topicsHref: name === 'index.html' ? '#topics' : `${base}/#topics`, repository: site.repository });
  if (!page?.includes(header) || inspected.get(path.join(output, name))?.classes.filter(name => name === 'site-header').length !== 1) failures.push(`${name}: header differs from shared template`);
  if (!page?.includes(renderFooter({ repository: site.repository })) || [...(page ?? '').matchAll(/<footer\b/g)].length !== 1) failures.push(`${name}: footer differs from shared template`);
}
if (!(await readFile(path.join(output, 'assets/site.css'), 'utf8')).trimEnd().endsWith(`${headerCss}\n\n${footerCss}`)) failures.push('Site header/footer CSS differs from shared template; run npm run build');
for (const topic of topics) {
  const markdown = await readFile(path.join(root, topic.slug, topic.markdown), 'utf8');
  const firstBlock = markdown.replace(/^\s*# [^\n]+\n/, '').trimStart().split(/\n\s*\n/)[0];
  if (/^\s*(?:>\s*)?(?:\*\*)?(?:创建(?:日期)?|内容更新(?:日期)?|类型|读者|核验截止)\s*(?:\*\*)?\s*[：:]/m.test(firstBlock)) failures.push(`${topic.slug}: remove opening metadata boilerplate; page dates come from catalog`);
  for (const name of [topic.markdown, topic.html]) {
    const original = await readFile(path.join(root, topic.slug, name));
    const published = await readFile(path.join(output, topic.slug, name));
    if (!original.equals(published)) failures.push(`${topic.slug}/${name}: published source differs from original`);
  }
  const report = documents.get(path.join(output, topic.slug, 'report/index.html'));
  if (!report?.includes('id="report-content"')) failures.push(`${topic.slug}: missing rendered Markdown reader`);
  if (!report?.includes(renderHeader({ homeHref: `${base}/`, topicsHref: `${base}/#topics`, repository: site.repository })) || inspected.get(path.join(output, topic.slug, 'report/index.html'))?.classes.filter(name => name === 'site-header').length !== 1) failures.push(`${topic.slug}: Markdown reader needs the single shared header`);
  if (!report?.includes(renderFooter({ repository: site.repository })) || [...(report ?? '').matchAll(/<footer\b/g)].length !== 1) failures.push(`${topic.slug}: Markdown reader needs the single shared footer`);
  const latestHtml = documents.get(path.join(output, topic.slug, topic.html));
  const headerBlock = latestHtml?.match(/<!-- archive:header:start -->([\s\S]*?)<!-- archive:header:end -->/)?.[1].trim();
  const expectedHeader = renderHeader({ homeHref: '../', topicsHref: '../#topics', contentHref: '#content', repository: site.repository, reportHref: './report/', interactive: true });
  if (headerBlock !== expectedHeader || inspected.get(path.join(output, topic.slug, topic.html))?.classes.filter(name => name === 'site-header').length !== 1) failures.push(`${topic.slug}: use the single shared site header; run npm run sync:interactive`);
  const embeddedStyle = latestHtml?.match(/<!-- archive:style:start -->\s*<style data-archive-style>\n([\s\S]*?)\n<\/style>\s*<!-- archive:style:end -->/);
  if (embeddedStyle?.[1] !== sharedCss) failures.push(`${topic.slug}: shared interactive CSS differs; run npm run sync:interactive`);
  const footerBlock = latestHtml?.match(/<!-- archive:footer:start -->([\s\S]*?)<!-- archive:footer:end -->/)?.[1].trim();
  if (footerBlock !== renderFooter({ repository: site.repository, interactive: true }) || [...(latestHtml ?? '').matchAll(/<footer\b/g)].length !== 1) failures.push(`${topic.slug}: use the single shared footer without repeated dates; run npm run sync:interactive`);
  const navigation = latestHtml?.match(/<!-- archive:navigation-script:start -->\s*<script data-archive-navigation>\n([\s\S]*?)\n<\/script>\s*<!-- archive:navigation-script:end -->/);
  if (navigation?.[1] !== sharedNavigation) failures.push(`${topic.slug}: shared directory script differs; run npm run sync:interactive`);
  const sidebarNav = elementBodyByClass(latestHtml, 'aside', 'sidebar').match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const directoryLabels = [...sidebarNav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map(match => decodeEntities(match[1].replace(/<[^>]+>/g, '')).trim());
  if (!directoryLabels.length || directoryLabels.some((label, index) => !label.startsWith(String(index + 1).padStart(2, '0') + ' '))) failures.push(`${topic.slug}: interactive directory needs static chapter numbers in reading order`);
  const heroClasses = inspectHtml(elementBodyByClass(latestHtml, 'header', 'hero')).classes;
  if (heroClasses.some(name => ['eyebrow', 'metadata'].includes(name)) || inspected.get(path.join(output, topic.slug, topic.html))?.classes.includes('reading-route')) failures.push(`${topic.slug}: remove opening format labels and decorative reading-route dividers`);
  const head = latestHtml?.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? '';
  const icons = inspected.get(path.join(output, topic.slug, topic.html))?.icons ?? [];
  const iconBlock = head.match(/<!-- archive:icon:start -->([\s\S]*?)<!-- archive:icon:end -->/);
  const managedIcons = inspectHtml(iconBlock?.[1] ?? '').icons;
  if (icons.length !== 1 || managedIcons.length !== 1 || icons[0].href !== faviconUri || icons[0].type !== 'image/svg+xml' || icons[0].sizes !== 'any' || managedIcons[0].href !== faviconUri) failures.push(`${topic.slug}: shared interactive favicon differs or is missing from head; run npm run sync:interactive`);
  const metadataBlock = latestHtml?.match(/<!-- archive:meta:start -->([\s\S]*?)<!-- archive:meta:end -->/);
  const metadataDates = [...(metadataBlock?.[1] ?? '').matchAll(/<time datetime="([^"]+)">([^<]+)<\/time>/g)];
  if (metadataDates.length !== 2 || metadataDates[0][1] !== topic.created || metadataDates[0][2] !== topic.created || metadataDates[1][1] !== topic.updated || metadataDates[1][2] !== topic.updated) failures.push(`${topic.slug}: interactive metadata dates differ from catalog`);
  for (const block of ['icon', 'header', 'footer', 'meta', 'navigation-script']) {
    if (latestHtml?.split(`<!-- archive:${block}:start -->`).length !== 2 || latestHtml?.split(`<!-- archive:${block}:end -->`).length !== 2) failures.push(`${topic.slug}: missing/duplicate shared ${block} markers`);
  }
  for (const version of topic.history ?? []) {
    for (const extension of ['markdown', 'html']) {
      const file = version[extension];
      const original = await readFile(path.join(root, topic.slug, file));
      const published = await readFile(path.join(output, topic.slug, file));
      if (!original.equals(published)) failures.push(`${topic.slug}/${file}: published history differs`);
      if (checksum(original) !== version.sha256?.[extension]) failures.push(`${topic.slug}/${file}: archived checksum differs`);
    }
    for (const [file, hash] of Object.entries(version.assetsSha256 ?? {})) {
      const original = await readFile(path.join(root, topic.slug, file));
      const published = await readFile(path.join(output, topic.slug, file));
      if (checksum(original) !== hash || !original.equals(published)) failures.push(`${topic.slug}/${file}: archived asset differs`);
    }
  }
  for (const [file, hash] of Object.entries(topic.assetsSha256 ?? {})) {
    const source = await readFile(path.join(root, topic.slug, file));
    const published = await readFile(path.join(output, topic.slug, file));
    if (checksum(source) !== hash || !source.equals(published)) failures.push(`${topic.slug}/${file}: latest asset differs from its content version`);
  }
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Checked ${htmlFiles.length} HTML pages, ${checked} local links/anchors, README dates, shared styles/icons, ${topics.length} latest pair(s), and ${topics.reduce((total, topic) => total + (topic.history?.length ?? 0), 0)} historical pair(s).`);
