// npm run verify:photos — checks every photo in src/data/photos.js against the
// Wikimedia Commons API (needs internet). Writes photo-credits.json with author,
// licence and size for each file, and lists any file that is missing or too small.
import fs from 'node:fs';
import { photos } from '../src/data/photos.js';

const files = [...new Set(Object.values(photos).filter((p) => p.file).map((p) => p.file))];
const out = {};
for (let i = 0; i < files.length; i += 45) {
  const batch = files.slice(i, i + 45);
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|size|url' +
    '&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl|ImageDescription&titles=' + encodeURIComponent(batch.map((f) => 'File:' + f.replace(/_/g, ' ')).join('|'));
  const res = await fetch(url, { headers: { 'User-Agent': 'european-summer-2027-photo-check/1.0' } });
  const json = await res.json();
  const norm = Object.fromEntries((json.query?.normalized || []).map((n) => [n.to, n.from]));
  for (const page of Object.values(json.query?.pages || {})) {
    const asked = (norm[page.title] || page.title).replace(/^File:/, '').replace(/ /g, '_');
    const info = page.imageinfo?.[0];
    const m = info?.extmetadata || {};
    const strip = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    out[asked] = page.missing !== undefined ? { missing: true } : {
      author: strip(m.Artist?.value), license: strip(m.LicenseShortName?.value), licenseUrl: m.LicenseUrl?.value,
      description: strip(m.ImageDescription?.value).slice(0, 200), width: info.width, height: info.height, page: info.descriptionurl,
    };
  }
}
fs.writeFileSync(new URL('../photo-credits.json', import.meta.url), JSON.stringify(out, null, 2));
let bad = 0;
for (const [id, p] of Object.entries(photos)) {
  if (!p.file) continue;
  const c = out[p.file.replace(/ /g, '_')];
  if (!c || c.missing) { bad++; console.log(`MISSING  ${id}  ${p.file}`); }
  else if (c.width < 1280 && id.endsWith('hero')) console.log(`SMALL    ${id}  ${c.width}px wide (hero)`);
  else console.log(`ok       ${id}  ${c.license}  ${c.author.slice(0, 40)}`);
}
console.log(`\n${files.length - bad}/${files.length} files found. Credits written to photo-credits.json`);
process.exit(bad ? 1 : 0);
