// Build script: bundles the React app with esbuild and compiles Tailwind CSS v4.
//   node build.mjs            → dist/ (static site + PWA, deploy to Vercel)
//   node build.mjs --inline   → dist-inline/index.html (one self-contained file)
//   node build.mjs --serve    → build, then serve dist/ on http://localhost:5173
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { createRequire } from 'node:module';
import * as esbuild from 'esbuild';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const INLINE = process.argv.includes('--inline');
const SERVE = process.argv.includes('--serve');
const OUT = path.join(ROOT, INLINE ? 'dist-inline' : 'dist');

// ── Tailwind v4 via its compile() API ─────────────────────────────────────
async function compileTailwind(cssPath) {
  const twDir = path.dirname(require.resolve('tailwindcss/package.json'));
  const { compile } = await import(path.join(twDir, 'dist/lib.mjs'));
  const input = fs.readFileSync(cssPath, 'utf8');
  const compiler = await compile(input, {
    base: path.dirname(cssPath),
    loadStylesheet: async (id, base) => {
      const file = id === 'tailwindcss' ? path.join(twDir, 'index.css')
        : id.startsWith('tailwindcss/') ? path.join(twDir, id.slice('tailwindcss/'.length))
        : path.resolve(base, id);
      return { path: file, base: path.dirname(file), content: fs.readFileSync(file, 'utf8') };
    },
  });
  const candidates = new Set();
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(jsx?|tsx?|html)$/.test(e.name)) (fs.readFileSync(p, 'utf8').match(/[A-Za-z0-9_\-:/[\].%#!@]+/g) || []).forEach((c) => candidates.add(c));
  });
  walk(path.join(ROOT, 'src'));
  return compiler.build([...candidates]);
}

const tailwindPlugin = {
  name: 'tailwind',
  setup(b) {
    b.onLoad({ filter: /styles\.css$/ }, async (args) => ({ contents: await compileTailwind(args.path), loader: 'css' }));
  },
};

const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name); const b2 = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b2) : fs.copyFileSync(a, b2);
  }
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600&family=Jost:wght@300..600&display=swap';
const DESCRIPTION = 'Our European summer, 24 July – 27 August 2027: Vienna, Montenegro, Albania and Greece, from the Adriatic mountains to the Ionian Sea.';

function html({ css, js, inline }) {
  const head = `<title>European Summer 2027</title>
<meta name="description" content="${DESCRIPTION}">
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#0e2338">
<meta property="og:title" content="European Summer 2027">
<meta property="og:description" content="${DESCRIPTION}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">`;
  if (inline) {
    return `${head}
<style>${css}</style>
<div id="root"></div>
<script>window.__ES27_INLINE__=true;</script>
<script>${js.replace(/<\/script/g, '<\\/script')}</script>
`;
  }
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Summer 2027">
<link rel="stylesheet" href="/assets/${css}">
<script type="module" src="/assets/${js}"></script>
</head>
<body>
<div id="root"></div>
<noscript>European Summer 2027 needs JavaScript to show the itinerary.</noscript>
</body>
</html>
`;
}

async function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, 'src/main.jsx')],
    bundle: true, minify: true, write: false, format: INLINE ? 'iife' : 'esm', target: ['es2020', 'safari15'],
    jsx: 'automatic', loader: { '.json': 'json' }, outdir: path.join(OUT, 'assets'),
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [tailwindPlugin], legalComments: 'none', logLevel: 'warning',
  });
  const js = result.outputFiles.find((f) => f.path.endsWith('.js')).contents;
  const css = result.outputFiles.find((f) => f.path.endsWith('.css')).contents;

  if (INLINE) {
    fs.writeFileSync(path.join(OUT, 'index.html'), html({ css: Buffer.from(css).toString(), js: Buffer.from(js).toString(), inline: true }));
    console.log('inline build →', path.join(OUT, 'index.html'), (fs.statSync(path.join(OUT, 'index.html')).size / 1024).toFixed(0), 'KB');
    return;
  }
  const jsName = `app.${hash(js)}.js`; const cssName = `app.${hash(css)}.css`;
  fs.writeFileSync(path.join(OUT, 'assets', jsName), js);
  fs.writeFileSync(path.join(OUT, 'assets', cssName), css);
  copyDir(path.join(ROOT, 'public'), OUT);
  fs.writeFileSync(path.join(OUT, 'index.html'), html({ css: cssName, js: jsName }));

  // Service worker with this build's precache list.
  const precache = ['/', `/assets/${jsName}`, `/assets/${cssName}`, '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png', '/icons/icon.svg'];
  const sw = fs.readFileSync(path.join(ROOT, 'src/sw.template.js'), 'utf8')
    .replace('__VERSION__', hash(js + css)).replace('__PRECACHE__', JSON.stringify(precache));
  fs.writeFileSync(path.join(OUT, 'sw.js'), sw);
  console.log('build →', OUT, jsName, (js.length / 1024).toFixed(0) + 'KB', cssName, (css.length / 1024).toFixed(0) + 'KB');
}

await build();

if (SERVE) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
  http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(OUT, p);
    if (!file.startsWith(OUT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(OUT, 'index.html');
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(5173, () => console.log('Serving on http://localhost:5173'));
}
