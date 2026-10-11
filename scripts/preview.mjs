import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const { site } = JSON.parse(await readFile(path.join(root, 'site/catalog.json'), 'utf8'));
const base = (process.env.BASE_PATH ?? site.basePath).replace(/\/$/, '');
const output = path.join(root, 'dist');
const port = Number(process.env.PORT ?? 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
await stat(path.join(output, 'index.html')).catch(() => { throw new Error('Run npm run build before previewing.'); });
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (base && pathname === '/') {
      response.writeHead(302, { Location: `${base}/` }); response.end(); return;
    }
    if (base && pathname !== base && !pathname.startsWith(`${base}/`)) throw new Error('Outside site base path');
    const relative = pathname.slice(base.length).replace(/^\//, '');
    let file = path.resolve(output, relative);
    if (file !== output && !file.startsWith(output + path.sep)) throw new Error('Invalid path');
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(302, { Location: `${pathname}/` }); response.end(); return;
      }
      file = path.join(file, 'index.html');
    }
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(await readFile(path.join(output, '404.html')));
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}${base}/`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
