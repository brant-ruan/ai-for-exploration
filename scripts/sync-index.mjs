import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { replaceReadmeIndex } from './archive-lib.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const { site, topics } = JSON.parse(await readFile(path.join(root, 'site/catalog.json'), 'utf8'));
const file = path.join(root, 'README.md');
const original = await readFile(file, 'utf8');
const updated = replaceReadmeIndex(original, site, topics);
if (original !== updated) await writeFile(file, updated);
console.log(`README index synchronized: ${topics.length} topic(s).`);
