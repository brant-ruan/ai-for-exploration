import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const { site, topics } = JSON.parse(await readFile(path.join(root, 'site/catalog.json'), 'utf8'));
const base = (process.env.BASE_PATH ?? site.basePath).replace(/\/$/, '');
const origin = 'https://local.invalid';
const failures = [];
const htmlFiles = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) await walk(path.join(dir, entry.name));
    else if (entry.name.endsWith('.html')) htmlFiles.push(path.join(dir, entry.name));
  }
}
await walk(output);
const documents = new Map();
for (const file of htmlFiles) documents.set(file, await readFile(file, 'utf8'));
let checked = 0;
for (const [file, html] of documents) {
  const ownIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((item) => item[1]);
  if (new Set(ownIds).size !== ownIds.length) failures.push(`${path.relative(output, file)}: duplicate HTML IDs`);
  const pageUrl = new URL(`${base}/${path.relative(output, file).split(path.sep).join('/')}`, origin);
  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(value)) continue;
    const resolved = new URL(value, pageUrl);
    if (resolved.origin !== origin) continue;
    const pathname = decodeURIComponent(resolved.pathname);
    if (base && !pathname.startsWith(`${base}/`)) {
      failures.push(`${path.relative(output, file)}: outside base path (${value})`); continue;
    }
    let target = path.resolve(output, pathname.slice(base.length).replace(/^\//, ''));
    if (target !== output && !target.startsWith(output + path.sep)) {
      failures.push(`${path.relative(output, file)}: invalid local path (${value})`); continue;
    }
    try {
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
      await stat(target);
      if (resolved.hash && target.endsWith('.html')) {
        const targetHtml = documents.get(target) ?? await readFile(target, 'utf8');
        const id = decodeURIComponent(resolved.hash.slice(1));
        const ids = [...targetHtml.matchAll(/\sid="([^"]+)"/g)].map((item) => item[1]);
        if (!ids.includes(id)) failures.push(`${path.relative(output, file)}: missing anchor (${value})`);
      }
      checked++;
    } catch {
      failures.push(`${path.relative(output, file)}: missing local file (${value})`);
    }
  }
}
for (const topic of topics) {
  for (const name of [topic.markdown, topic.html]) {
    const original = await readFile(path.join(root, topic.slug, name));
    const published = await readFile(path.join(output, topic.slug, name));
    if (!original.equals(published)) failures.push(`${topic.slug}/${name}: published source differs from original`);
  }
  const report = documents.get(path.join(output, topic.slug, 'report/index.html'));
  if (!report?.includes('id="report-content"')) failures.push(`${topic.slug}: missing rendered Markdown reader`);
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Checked ${htmlFiles.length} HTML pages, ${checked} local links/anchors, and ${topics.length} original artifact pair(s).`);
