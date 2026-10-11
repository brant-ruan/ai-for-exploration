import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { updateArchive, parseArguments } from './update-archive.mjs';
import { validateDate, renderTopicTable, replaceReadmeIndex } from './archive-lib.mjs';

const slug = 'investigation-test';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const script = fileURLToPath(new URL('./update-archive.mjs', import.meta.url));
const originalMd = Buffer.from('# Old report\r\n\r\n原始资料\n');
const originalHtml = Buffer.from('<!doctype html>\r\n<title>Old</title>\n');
const newMd = '# Updated report\n新的研究内容\n';
const newHtml = '<!doctype html><title>Updated</title><p>新图示</p>';
const site = { title: 'Test', url: 'https://example.github.io', basePath: '/archive' };

async function fixture(t) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'archive-test-'));
  t.after(() => fs.rm(temp, { recursive: true, force: true }));
  const root = path.join(temp, 'repo');
  await fs.mkdir(path.join(root, slug, 'assets'), { recursive: true });
  await fs.mkdir(path.join(root, 'site'));
  const topic = { slug, title: 'Test topic', subtitle: '详细说明', kind: 'investigation',
    created: '2026-10-01', updated: '2026-10-11',
    markdown: slug + '-latest.md', html: slug + '-latest.html',
    summary: 'Topic summary', tags: [], assets: ['assets/'], history: [] };
  const catalog = { site, topics: [topic] };
  const readme = '# Archive\n\n<!-- topics:start -->\nold index\n<!-- topics:end -->\n\nPreserve footer.\n';
  await fs.writeFile(path.join(root, 'site/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  await fs.writeFile(path.join(root, 'README.md'), readme);
  await fs.writeFile(path.join(root, '.gitignore'), 'dist/\nwork/\n');
  await fs.writeFile(path.join(root, slug, topic.markdown), originalMd);
  await fs.writeFile(path.join(root, slug, topic.html), originalHtml);
  await fs.writeFile(path.join(root, slug, 'assets/diagram.svg'), '<svg>immutable original</svg>\n');
  await fs.writeFile(path.join(temp, 'draft.md'), newMd);
  await fs.writeFile(path.join(temp, 'draft.html'), newHtml);
  const options = { root, slug, date: '2026-10-12', markdown: path.join(temp, 'draft.md'),
    html: path.join(temp, 'draft.html'), summary: '修正机制说明并补充图示' };
  return { root, temp, topic, catalog, readme, options };
}

async function snapshot(root) {
  const files = {};
  async function visit(relative = '') {
    for (const name of (await fs.readdir(path.join(root, relative))).sort()) {
      if (!relative && name === 'work') continue;
      const next = relative ? relative + '/' + name : name;
      const metadata = await fs.lstat(path.join(root, next));
      if (metadata.isDirectory()) await visit(next);
      else files[next] = await fs.readFile(path.join(root, next));
    }
  }
  await visit();
  return files;
}

async function catalogAt(root) {
  return JSON.parse(await fs.readFile(path.join(root, 'site/catalog.json'), 'utf8'));
}

test('strict calendar dates and reusable README renderer', () => {
  assert.equal(validateDate('2024-02-29'), '2024-02-29');
  for (const invalid of ['2023-02-29', '2026-04-31', '2026-13-01', '2026-1-01', '0000-01-01']) {
    assert.throws(() => validateDate(invalid), /date/);
  }
  const topic = { slug, title: 'A | [B]', subtitle: 'One\ntwo',
    created: '2026-10-01', updated: '2026-10-11',
    markdown: slug + '-latest.md', html: slug + '-latest.html' };
  const table = renderTopicTable(site, [topic]);
  assert.match(table, /创建日期 \| 更新日期/);
  assert.match(table, /A \\\| \\\[B\\\]/);
  assert.match(table, /https:\/\/example.github.io\/archive\/investigation-test\/report\//);
  assert.match(table, /investigation-test-latest\.html/);
  const readme = 'before\n<!-- topics:start -->old<!-- topics:end -->\nafter';
  assert.equal(replaceReadmeIndex(readme, site, [topic]),
    'before\n<!-- topics:start -->\n\n' + table + '\n\n<!-- topics:end -->\nafter');
  assert.throws(() => replaceReadmeIndex('no markers', site, [topic]), /exactly one/);
});

test('successful update preserves archived bytes, old date, assets and created date', async (t) => {
  const { root, options, topic } = await fixture(t);
  const result = await updateArchive(options);
  assert.equal(result.version, '20261011');
  const updated = (await catalogAt(root)).topics[0];
  assert.equal(updated.created, topic.created);
  assert.equal(updated.updated, '2026-10-12');
  assert.equal(updated.history[0].date, '2026-10-11');
  assert.equal(updated.history[0].summary, options.summary);
  assert.deepEqual(updated.history[0].assets, ['assets/']);
  assert.equal(updated.history[0].sha256.markdown, sha256(originalMd));
  assert.equal(updated.history[0].sha256.html, sha256(originalHtml));
  assert.equal(updated.history[0].assetsSha256['assets/diagram.svg'],
    sha256('<svg>immutable original</svg>\n'));
  assert.deepEqual(await fs.readFile(path.join(root, slug, slug + '-20261011.md')), originalMd);
  assert.deepEqual(await fs.readFile(path.join(root, slug, slug + '-20261011.html')), originalHtml);
  assert.equal(await fs.readFile(path.join(root, slug, topic.markdown), 'utf8'), newMd);
  assert.equal(await fs.readFile(path.join(root, slug, topic.html), 'utf8'), newHtml);
  const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
  assert.match(readme, /2026-10-01 \| 2026-10-12/);
  assert.match(readme, /\/report\//);
  assert.match(readme, /investigation-test-latest\.md/);
  assert.ok(readme.endsWith('\n\nPreserve footer.\n'));
  assert.deepEqual(await fs.readdir(path.join(root, 'work')), []);
});

test('same-day updates number collisions and never overwrite recorded or unregistered files', async (t) => {
  const { root, options, temp } = await fixture(t);
  options.date = '2026-10-11';
  await updateArchive(options);
  await fs.writeFile(path.join(temp, 'draft.md'), '# Second\n');
  await fs.writeFile(path.join(temp, 'draft.html'), '<title>Second</title>');
  assert.equal((await updateArchive(options)).version, '20261011-2');
  const secondMd = await fs.readFile(path.join(root, slug, slug + '-20261011-2.md'));
  await fs.writeFile(path.join(root, slug, slug + '-20261011-3.html'), 'unregistered collision');
  await fs.writeFile(path.join(temp, 'draft.md'), '# Third\n');
  await fs.writeFile(path.join(temp, 'draft.html'), '<title>Third</title>');
  assert.equal((await updateArchive(options)).version, '20261011-4');
  assert.deepEqual(await fs.readFile(path.join(root, slug, slug + '-20261011-2.md')), secondMd);
  assert.equal(await fs.readFile(path.join(root, slug, slug + '-20261011-3.html'), 'utf8'),
    'unregistered collision');
});

test('invalid input does not archive or modify managed files', async (t) => {
  const { root, options, temp } = await fixture(t);
  const before = await snapshot(root);
  for (const changes of [
    { date: '2026-10-10' }, { date: '2026-02-30' }, { summary: '  ' },
    { slug: '../escape' }, { slug: 'missing-topic' },
    { markdown: path.join(temp, 'missing.md') }, { html: path.join(temp, 'missing.html') }
  ]) {
    await assert.rejects(updateArchive({ ...options, ...changes }));
    assert.deepEqual(await snapshot(root), before);
  }
  await fs.writeFile(options.markdown, '');
  await assert.rejects(updateArchive(options), /Empty markdown/);
  assert.deepEqual(await snapshot(root), before);
  await fs.writeFile(options.markdown, originalMd);
  await assert.rejects(updateArchive(options), /unchanged markdown/);
  assert.deepEqual(await snapshot(root), before);
  await fs.writeFile(options.markdown, newMd);
  await fs.writeFile(options.html, originalHtml);
  await assert.rejects(updateArchive(options), /unchanged html/);
  assert.deepEqual(await snapshot(root), before);
});

test('missing markers and symlink assets fail before archiving', async (t) => {
  const { root, options } = await fixture(t);
  await fs.writeFile(path.join(root, 'README.md'), '# No markers');
  let before = await snapshot(root);
  await assert.rejects(updateArchive(options), /topics:start/);
  assert.deepEqual(await snapshot(root), before);
  await fs.writeFile(path.join(root, 'README.md'), '<!-- topics:start --><!-- topics:end -->');
  await fs.symlink('diagram.svg', path.join(root, slug, 'assets/alias.svg'));
  before = await snapshot(root);
  await assert.rejects(updateArchive(options), /symlinks/);
  assert.deepEqual(await snapshot(root), before);
});

test('changed historical assets or reports block later publication', async (t) => {
  const { root, options, temp } = await fixture(t);
  await updateArchive(options);
  await fs.writeFile(path.join(temp, 'draft.md'), '# Next\n');
  await fs.writeFile(path.join(temp, 'draft.html'), '<title>Next</title>');
  await fs.writeFile(path.join(root, slug, 'assets/diagram.svg'), 'overwritten asset');
  let before = await snapshot(root);
  await assert.rejects(updateArchive({ ...options, date: '2026-10-13' }), /Historical resource changed/);
  assert.deepEqual(await snapshot(root), before);
  await fs.writeFile(path.join(root, slug, 'assets/diagram.svg'), '<svg>immutable original</svg>\n');
  await fs.writeFile(path.join(root, slug, slug + '-20261011.md'), 'overwritten history');
  before = await snapshot(root);
  await assert.rejects(updateArchive({ ...options, date: '2026-10-13' }), /Historical report changed/);
  assert.deepEqual(await snapshot(root), before);
});

test('a replacement write failure restores all originals and removes only new archives', async (t) => {
  const { root, options } = await fixture(t);
  const collision = path.join(root, slug, slug + '-20261011.md');
  await fs.writeFile(collision, 'pre-existing archive');
  const before = await snapshot(root);
  let publications = 0;
  await assert.rejects(updateArchive(options, {
    rename: async (from, to) => {
      if (from.includes(path.sep + 'staged' + path.sep) && ++publications === 4) {
        throw new Error('Injected README write failure');
      }
      return fs.rename(from, to);
    }
  }), /Injected README write failure/);
  assert.deepEqual(await snapshot(root), before);
  assert.deepEqual(await fs.readdir(path.join(root, 'work')), []);
});

test('rollback failure retains recoverable originals, archive and lock', async (t) => {
  const { root, options } = await fixture(t);
  let publications = 0;
  await assert.rejects(updateArchive(options, {
    rename: async (from, to) => {
      if (from.includes(path.sep + 'staged' + path.sep) && ++publications === 4) {
        throw new Error('Injected publish failure');
      }
      if (path.basename(from).startsWith('restore-')) throw new Error('Injected rollback failure');
      return fs.rename(from, to);
    }
  }), /rollback was incomplete.*Keep recovery material/);
  const work = await fs.readdir(path.join(root, 'work'));
  assert.ok(work.includes('.archive-update.lock'));
  const transaction = work.find((name) => name.startsWith('archive-transaction-'));
  assert.ok(transaction);
  const recovery = path.join(root, 'work', transaction);
  const manifest = JSON.parse(await fs.readFile(path.join(recovery, 'manifest.json'), 'utf8'));
  assert.equal(manifest.restore.length, 4);
  assert.deepEqual(await fs.readFile(path.join(recovery, 'originals/0')), originalMd);
  assert.deepEqual(await fs.readFile(path.join(root, slug, slug + '-20261011.md')), originalMd);
  await assert.rejects(updateArchive(options), /locked/);
});


test('new --assets list updates latest while history retains old list and resource bytes', async (t) => {
  const { root, temp, options, catalog } = await fixture(t);
  catalog.topics[0].assets = ['assets/diagram.svg'];
  await fs.writeFile(path.join(root, 'site/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  const oldAsset = await fs.readFile(path.join(root, slug, 'assets/diagram.svg'));
  const nextAsset = Buffer.from('<svg>new immutable diagram</svg>\n');
  await fs.writeFile(path.join(root, slug, 'assets/diagram-v2.svg'), nextAsset);
  options.assets = path.join(temp, 'assets.json');
  await fs.writeFile(options.assets, JSON.stringify(['assets/diagram-v2.svg']));
  const args = Object.entries(options).flatMap(([key, value]) => ['--' + key, value]);
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const updated = (await catalogAt(root)).topics[0];
  assert.deepEqual(updated.assets, ['assets/diagram-v2.svg']);
  assert.deepEqual(updated.assetsSha256, { 'assets/diagram-v2.svg': sha256(nextAsset) });
  assert.deepEqual(updated.history[0].assets, ['assets/diagram.svg']);
  assert.deepEqual(updated.history[0].assetsSha256, { 'assets/diagram.svg': sha256(oldAsset) });
  assert.deepEqual(await fs.readFile(path.join(root, slug, 'assets/diagram.svg')), oldAsset);
  assert.deepEqual(await fs.readFile(path.join(root, slug, slug + '-20261011.md')), originalMd);
  assert.deepEqual(await fs.readFile(path.join(root, slug, slug + '-20261011.html')), originalHtml);
});

test('invalid new asset input cannot archive or modify managed files', async (t) => {
  const { root, temp, options } = await fixture(t);
  options.assets = path.join(temp, 'assets.json');
  const before = await snapshot(root);
  for (const json of ['{', '{}', '"assets/diagram.svg"', '[123]',
    '["assets/missing.svg"]', '["../escape"]']) {
    await fs.writeFile(options.assets, json);
    await assert.rejects(updateArchive(options));
    assert.deepEqual(await snapshot(root), before);
  }
});

test('new resources are rechecked during publication and external resource changes remain untouched', async (t) => {
  const { root, temp, options, catalog } = await fixture(t);
  catalog.topics[0].assets = ['assets/diagram.svg'];
  await fs.writeFile(path.join(root, 'site/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  const nextPath = path.join(root, slug, 'assets/diagram-v2.svg');
  await fs.writeFile(nextPath, '<svg>new resource</svg>');
  options.assets = path.join(temp, 'assets.json');
  await fs.writeFile(options.assets, JSON.stringify(['assets/diagram-v2.svg']));
  const before = await snapshot(root);
  let touched = false;
  await assert.rejects(updateArchive(options, {
    rename: async (from, to) => {
      await fs.rename(from, to);
      if (!touched && from.includes(path.sep + 'staged' + path.sep)) {
        touched = true;
        await fs.writeFile(nextPath, 'external resource edit');
      }
    }
  }), /resource changed/i);
  before[slug + '/assets/diagram-v2.svg'] = Buffer.from('external resource edit');
  assert.deepEqual(await snapshot(root), before);
  assert.deepEqual(await fs.readdir(path.join(root, 'work')), []);
});

test('rollback preserves third-party edits made before a failed HTML replacement', async (t) => {
  const { root, options } = await fixture(t);
  const before = await snapshot(root);
  let publications = 0;
  await assert.rejects(updateArchive(options, {
    rename: async (from, to) => {
      if (from.includes(path.sep + 'staged' + path.sep) && ++publications === 2) {
        await fs.writeFile(path.join(root, slug, slug + '-latest.md'), '# Third-party edit\n');
        throw new Error('Injected HTML publish failure');
      }
      return fs.rename(from, to);
    }
  }), /rollback was incomplete.*Concurrent edit detected during rollback.*latest\.md/);
  assert.equal(await fs.readFile(path.join(root, slug, slug + '-latest.md'), 'utf8'), '# Third-party edit\n');
  assert.deepEqual(await fs.readFile(path.join(root, slug, slug + '-latest.html')), originalHtml);
  assert.deepEqual(await fs.readFile(path.join(root, 'site/catalog.json')), before['site/catalog.json']);
  assert.deepEqual(await fs.readFile(path.join(root, 'README.md')), before['README.md']);
  const work = await fs.readdir(path.join(root, 'work'));
  assert.ok(work.includes('.archive-update.lock'));
  const transaction = work.find((name) => name.startsWith('archive-transaction-'));
  const recovery = path.join(root, 'work', transaction);
  assert.deepEqual(await fs.readFile(path.join(recovery, 'originals/0')), originalMd);
  const manifest = JSON.parse(await fs.readFile(path.join(recovery, 'manifest.json'), 'utf8'));
  assert.equal(manifest.restore[0].newSha256, sha256(newMd));
  assert.deepEqual(await fs.readFile(path.join(root, slug, slug + '-20261011.md')), originalMd);
  await assert.rejects(updateArchive(options), /locked/);
});

test('CLI accepts --root and strict argument errors without running on the real repository', async (t) => {
  const { root, options } = await fixture(t);
  assert.throws(() => parseArguments(['--unknown', 'x']), /Usage/);
  assert.throws(() => parseArguments(['--slug', slug, '--slug', slug]), /Usage/);
  const args = Object.entries(options).flatMap(([key, value]) => ['--' + key, value]);
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /archived as 20261011/);
  assert.equal((await catalogAt(root)).topics[0].updated, options.date);
});
