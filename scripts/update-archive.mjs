import * as fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateDate, replaceReadmeIndex } from './archive-lib.mjs';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const usage = 'Usage: node scripts/update-archive.mjs --slug <slug> --date YYYY-MM-DD ' +
  '--markdown <draft.md> --html <draft.html> --summary <change summary> ' +
  '[--assets <new-assets.json>] [--root <repo>]';

export function parseArguments(args) {
  const options = {};
  const allowed = new Set(['slug', 'date', 'markdown', 'html', 'summary', 'assets', 'root']);
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.replace(/^--/, '');
    if (!args[index]?.startsWith('--') || !allowed.has(key) || key in options ||
        !args[index + 1] || args[index + 1].startsWith('--')) {
      throw new Error(usage);
    }
    options[key] = args[index + 1];
  }
  return options;
}

function relativeFile(value) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || value.includes('\\')) {
    throw new Error('Invalid relative resource path: ' + value);
  }
  const normalized = value.replace(/\/+$/, '');
  if (!normalized || normalized.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('Invalid relative resource path: ' + value);
  }
  return normalized;
}

async function exists(filename) {
  try { await fs.lstat(filename); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

// Refuse symlinks at every component of a managed repository path.
async function checkedPath(root, relative) {
  const normalized = relativeFile(relative);
  let current = root;
  for (const component of normalized.split('/')) {
    current = path.join(current, component);
    if ((await fs.lstat(current)).isSymbolicLink()) {
      throw new Error('Managed paths must not be symlinks: ' + current);
    }
  }
  return current;
}

async function readManaged(root, relative) {
  const filename = await checkedPath(root, relative);
  const metadata = await fs.stat(filename);
  if (!metadata.isFile()) throw new Error('Expected a regular file: ' + filename);
  return { relative, filename, bytes: await fs.readFile(filename), mode: metadata.mode & 0o777 };
}

async function hashAssets(root, slug, assets) {
  if (!Array.isArray(assets) || assets.some((asset) => typeof asset !== 'string')) {
    throw new Error('assets must be an array: ' + slug);
  }
  const hashes = Object.create(null);
  async function visit(relative) {
    const filename = await checkedPath(root, slug + '/' + relative);
    const metadata = await fs.stat(filename);
    if (metadata.isDirectory()) {
      for (const child of (await fs.readdir(filename)).sort()) await visit(relative + '/' + child);
    } else if (metadata.isFile()) {
      if (relative === slug + '-latest.md' || relative === slug + '-latest.html') {
        throw new Error('Latest reports cannot also be declared as assets');
      }
      hashes[relative] = digest(await fs.readFile(filename));
    } else {
      throw new Error('Assets must be regular files or directories: ' + relative);
    }
  }
  for (const asset of assets) await visit(relativeFile(asset));
  return hashes;
}

async function checkHashMap(root, slug, hashes, label) {
  if (!hashes || typeof hashes !== 'object' || Array.isArray(hashes)) {
    throw new Error('Invalid assetsSha256 map: ' + label);
  }
  for (const [relative, expected] of Object.entries(hashes)) {
    if (!/^[a-f0-9]{64}$/.test(expected)) throw new Error('Invalid SHA-256: ' + label);
    const file = await readManaged(root, slug + '/' + relativeFile(relative));
    if (digest(file.bytes) !== expected) {
      throw new Error('Historical resource changed: ' + slug + '/' + relative);
    }
  }
}

async function verifyHistory(root, topic) {
  if (!Array.isArray(topic.history)) throw new Error('history must be an array: ' + topic.slug);
  const versions = new Set();
  for (const entry of topic.history) {
    validateDate(entry.date);
    const stem = entry.date.replaceAll('-', '');
    const suffix = entry.version?.slice(stem.length);
    if (typeof entry.version !== 'string' || !entry.version.startsWith(stem) ||
        (suffix !== '' && (!/^-[1-9]\d*$/.test(suffix) || Number(suffix.slice(1)) < 2)) ||
        versions.has(entry.version)) {
      throw new Error('Invalid or duplicate history version: ' + entry.version);
    }
    versions.add(entry.version);
    if (entry.markdown !== topic.slug + '-' + entry.version + '.md' ||
        entry.html !== topic.slug + '-' + entry.version + '.html' ||
        typeof entry.summary !== 'string' || !entry.summary.trim() || !Array.isArray(entry.assets)) {
      throw new Error('Invalid history record: ' + entry.version);
    }
    for (const kind of ['markdown', 'html']) {
      if (!/^[a-f0-9]{64}$/.test(entry.sha256?.[kind])) throw new Error('Missing history SHA-256');
      const archived = await readManaged(root, topic.slug + '/' + entry[kind]);
      if (digest(archived.bytes) !== entry.sha256[kind]) {
        throw new Error('Historical report changed: ' + archived.relative);
      }
    }
    if (entry.assetsSha256 !== undefined) {
      await checkHashMap(root, topic.slug, entry.assetsSha256, entry.version);
    }
  }
  if (topic.assetsSha256 !== undefined) {
    await checkHashMap(root, topic.slug, topic.assetsSha256, 'latest');
  }
}

async function chooseVersion(root, topic) {
  const stem = topic.updated.replaceAll('-', '');
  const recorded = new Set(topic.history.map((entry) => entry.version));
  for (let number = 1; ; number++) {
    const version = stem + (number === 1 ? '' : '-' + number);
    if (recorded.has(version)) continue;
    const markdown = topic.slug + '-' + version + '.md';
    const html = topic.slug + '-' + version + '.html';
    if (!await exists(path.join(root, topic.slug, markdown)) &&
        !await exists(path.join(root, topic.slug, html))) {
      return { version, markdown, html };
    }
  }
}

async function assertTargetBytes(root, original, expected, phase) {
  const current = await readManaged(root, original.relative);
  if (!current.bytes.equals(expected)) {
    throw new Error('Concurrent edit detected during ' + phase + '; preserving ' + original.relative);
  }
}

async function assertUnchanged(root, originals, topic, assetHashes) {
  for (const original of originals) await assertTargetBytes(root, original, original.bytes, 'update');
  await checkHashMap(root, topic.slug, assetHashes, 'pending archive');
  await verifyHistory(root, topic);
}

async function writeExclusive(filename, bytes, mode, created) {
  const handle = await fs.open(filename, 'wx', mode);
  created.push(filename); // Includes partial writes, but never pre-existing files.
  try { await handle.writeFile(bytes); await handle.sync(); }
  finally { await handle.close(); }
}

// The optional filesystem override is for fault-injection tests; the CLI never exposes it.
export async function updateArchive(options, { rename = fs.rename } = {}) {
  for (const key of ['slug', 'date', 'markdown', 'html', 'summary']) {
    if (typeof options[key] !== 'string' || !options[key].trim()) throw new Error('Missing --' + key);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.slug)) throw new Error('Invalid --slug');
  validateDate(options.date);
  const root = await fs.realpath(path.resolve(options.root ?? defaultRoot));
  const pendingLock = path.join(root, 'work', '.archive-update.lock');
  if (await exists(pendingLock)) throw new Error('Archive update locked; inspect ' + pendingLock);
  const catalogFile = await readManaged(root, 'site/catalog.json');
  const readmeFile = await readManaged(root, 'README.md');
  const catalog = JSON.parse(catalogFile.bytes.toString('utf8'));
  if (!Array.isArray(catalog.topics)) throw new Error('catalog.topics must be an array');
  if (new Set(catalog.topics.map((topic) => topic.slug)).size !== catalog.topics.length) {
    throw new Error('Duplicate topic slug');
  }
  const topic = catalog.topics.find((item) => item.slug === options.slug);
  if (!topic) throw new Error('Unknown topic: ' + options.slug);
  validateDate(topic.created);
  validateDate(topic.updated);
  if (topic.created > topic.updated || options.date < topic.updated) {
    throw new Error('Update date must not precede old updated; created must not exceed updated');
  }
  if (topic.markdown !== topic.slug + '-latest.md' || topic.html !== topic.slug + '-latest.html') {
    throw new Error('Topic must use <slug>-latest.md/html');
  }
  const oldMarkdown = await readManaged(root, topic.slug + '/' + topic.markdown);
  const oldHtml = await readManaged(root, topic.slug + '/' + topic.html);
  const draftMarkdown = await fs.readFile(path.resolve(options.markdown));
  const draftHtml = await fs.readFile(path.resolve(options.html));
  for (const [label, draft, old] of [
    ['markdown', draftMarkdown, oldMarkdown.bytes], ['html', draftHtml, oldHtml.bytes]
  ]) {
    if (!draft.length || !draft.toString('utf8').trim()) throw new Error('Empty ' + label + ' draft');
    if (draft.equals(old)) throw new Error('Both drafts must change; unchanged ' + label);
  }
  await verifyHistory(root, topic);
  const assets = await hashAssets(root, topic.slug, topic.assets);
  if (options.assets !== undefined && (typeof options.assets !== 'string' || !options.assets.trim())) {
    throw new Error('Invalid --assets JSON file path');
  }
  const nextAssets = options.assets === undefined ? [...topic.assets] :
    JSON.parse(await fs.readFile(path.resolve(options.assets), 'utf8'));
  const nextAssetsHashes = await hashAssets(root, topic.slug, nextAssets);
  const archive = await chooseVersion(root, topic);
  const history = {
    ...archive, date: topic.updated, summary: options.summary.trim(),
    sha256: { markdown: digest(oldMarkdown.bytes), html: digest(oldHtml.bytes) },
    assets: [...topic.assets], assetsSha256: assets
  };
  const nextTopic = { ...topic, updated: options.date, history: [...topic.history, history],
    assets: nextAssets, assetsSha256: nextAssetsHashes };
  const nextCatalog = { ...catalog,
    topics: catalog.topics.map((item) => item === topic ? nextTopic : item) };
  const nextReadme = replaceReadmeIndex(readmeFile.bytes.toString('utf8'), catalog.site, nextCatalog.topics);
  const originals = [oldMarkdown, oldHtml, catalogFile, readmeFile];
  const updates = [draftMarkdown, draftHtml,
    Buffer.from(JSON.stringify(nextCatalog, null, 2) + '\n'), Buffer.from(nextReadme)];
  const ignore = await readManaged(root, '.gitignore');
  if (!ignore.bytes.toString('utf8').split(/\r?\n/).some((line) => /^\/?work\/$/.test(line.trim()))) {
    throw new Error('Transactions require ignored work/ in .gitignore');
  }

  const work = path.join(root, 'work');
  await fs.mkdir(work, { recursive: true });
  await checkedPath(root, 'work');
  const lock = path.join(work, '.archive-update.lock');
  try { await fs.mkdir(lock); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('Archive update locked; inspect ' + lock);
    throw error;
  }
  let transaction;
  const created = [];
  const applied = [];
  let committed = false;
  try {
    transaction = await fs.mkdtemp(path.join(work, 'archive-transaction-'));
    await fs.mkdir(path.join(transaction, 'originals'));
    await fs.mkdir(path.join(transaction, 'staged'));
    await fs.writeFile(path.join(transaction, 'manifest.json'), JSON.stringify({
      slug: topic.slug, version: archive.version,
      restore: originals.map((file, index) => ({
        target: file.relative, backup: 'originals/' + index,
        sha256: digest(file.bytes), newSha256: digest(updates[index]), mode: file.mode
      })),
      archives: [topic.slug + '/' + archive.markdown, topic.slug + '/' + archive.html],
      archiveAssetsSha256: assets, latestAssetsSha256: nextAssetsHashes,
      note: 'Restore all original backups before removing archives; retain this directory if recovery fails.'
    }, null, 2) + '\n', { flag: 'wx' });
    for (let index = 0; index < originals.length; index++) {
      await fs.writeFile(path.join(transaction, 'originals', String(index)), originals[index].bytes,
        { flag: 'wx', mode: originals[index].mode });
      await fs.writeFile(path.join(transaction, 'staged', String(index)), updates[index],
        { flag: 'wx', mode: originals[index].mode });
    }
    await assertUnchanged(root, originals, topic, assets);
    await checkHashMap(root, topic.slug, nextAssetsHashes, 'new assets');
    await writeExclusive(path.join(root, topic.slug, archive.markdown), oldMarkdown.bytes,
      oldMarkdown.mode, created);
    await writeExclusive(path.join(root, topic.slug, archive.html), oldHtml.bytes, oldHtml.mode, created);
    await assertUnchanged(root, originals, topic, assets);
    for (let index = 0; index < originals.length; index++) {
      await checkHashMap(root, topic.slug, assets, 'pending archive');
      await checkHashMap(root, topic.slug, nextAssetsHashes, 'new assets');
      await assertTargetBytes(root, originals[index], originals[index].bytes, 'publication');
      await rename(path.join(transaction, 'staged', String(index)), originals[index].filename);
      applied.push(index);
    }
    for (let index = 0; index < originals.length; index++) {
      await assertTargetBytes(root, originals[index], updates[index], 'publication verification');
    }
    committed = true;
  } catch (failure) {
    const recoveryErrors = [];
    for (const index of [...applied].reverse()) {
      try {
        await assertTargetBytes(root, originals[index], updates[index], 'rollback');
        const restore = path.join(transaction, 'restore-' + index);
        await fs.copyFile(path.join(transaction, 'originals', String(index)), restore);
        await assertTargetBytes(root, originals[index], updates[index], 'rollback');
        await rename(restore, originals[index].filename);
      } catch (error) { recoveryErrors.push(error); }
    }
    if (!recoveryErrors.length) {
      for (const filename of [...created].reverse()) {
        try { await fs.unlink(filename); }
        catch (error) { recoveryErrors.push(error); }
      }
    }
    if (recoveryErrors.length) {
      throw new AggregateError([failure, ...recoveryErrors],
        'Update failed and rollback was incomplete. Keep recovery material at ' + transaction +
        ' and lock ' + lock + '. Original failure: ' + failure.message +
        '. Recovery errors: ' + recoveryErrors.map((error) => error.message).join('; '));
    }
    // The previous files are restored; failed staging can now be discarded.
    try {
      if (transaction) await fs.rm(transaction, { recursive: true });
      await fs.rm(lock, { recursive: true });
    } catch (cleanup) {
      throw new AggregateError([failure, cleanup],
        'Update rolled back, but cleanup failed. Inspect recovery material at ' + transaction +
        ' and lock ' + lock + '. Original failure: ' + failure.message);
    }
    throw failure;
  }
  let warning;
  if (committed) {
    try {
      await fs.rm(transaction, { recursive: true });
      await fs.rm(lock, { recursive: true });
    } catch (error) {
      warning = 'Update committed; cleanup failed. Inspect ' + transaction + ' and ' + lock +
        ': ' + error.message;
    }
  }
  return { slug: topic.slug, version: archive.version, updated: options.date,
    archive: history, ...(warning ? { warning } : {}) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await updateArchive(parseArguments(process.argv.slice(2)));
    console.log('Updated ' + result.slug + ' to ' + result.updated +
      '; previous latest archived as ' + result.version + '.');
    if (result.warning) console.warn(result.warning);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
