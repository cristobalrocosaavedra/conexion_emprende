// Servidor local que imita Cloudflare Pages para apps/web/out (solo pruebas).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve("apps/web/out");
const port = Number(process.env.PORT ?? 3013);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};
const isFile = async (file) =>
  (await stat(file).catch(() => null))?.isFile() ?? false;
createServer(async (req, res) => {
  const pathname = decodeURIComponent(
    new URL(req.url, "http://127.0.0.1").pathname,
  );
  const base = resolve(root, "." + pathname);
  if (base !== root && !base.startsWith(root + sep))
    return res.writeHead(403).end();
  // Como Pages: archivo exacto, luego .html, luego index.html de carpeta.
  const candidates = [base, base + ".html", resolve(base, "index.html")];
  if (pathname.startsWith("/explorar/") || pathname === "/explorar")
    candidates.push(resolve(root, "explorar/index.html"));
  for (const file of candidates)
    if (await isFile(file)) {
      res.writeHead(200, {
        "Content-Type": types[extname(file)] ?? "application/octet-stream",
      });
      return res.end(await readFile(file));
    }
  res.writeHead(404, { "Content-Type": types[".html"] });
  res.end(await readFile(resolve(root, "404.html")).catch(() => ""));
}).listen(port, "127.0.0.1");
console.log(`Sitio en http://127.0.0.1:${port}`);
