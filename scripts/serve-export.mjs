// Local preview of the static export in out/, serving it the way Cloudflare
// Pages does: /path -> /path.html, public/_redirects rules, and 404.html.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = 'out';
const port = Number(process.env.PORT || 3000);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml', '.webmanifest':'application/manifest+json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2' };
const redirects = (await readFile(join(root, '_redirects'), 'utf8').catch(() => ''))
  .split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  .map(line => line.split(/\s+/));

async function file(path) {
  try { return (await stat(path)).isFile() ? path : null; } catch { return null; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = decodeURIComponent(url.pathname);
  const rule = redirects.find(([from]) => from === path);
  if (rule) { res.writeHead(Number(rule[2] || 301), { Location: rule[1] }); return res.end(); }
  const base = normalize(join(root, path));
  if (!base.startsWith(root)) { res.writeHead(400); return res.end(); }
  const found = await file(base) || await file(base + '.html') || await file(join(base, 'index.html'));
  const target = found || join(root, '404.html');
  res.writeHead(found ? 200 : 404, { 'Content-Type': types[extname(target)] || 'application/octet-stream' });
  res.end(await readFile(target));
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root}/ on http://127.0.0.1:${port}`));
