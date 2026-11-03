import { md5 } from './md5.js';
import { photos } from '../data/photos.js';

// Wikimedia serves thumbnails in a fixed set of widths; stick to those.
export const WIDTHS = [500, 960, 1280, 1920];

const enc = (name) => encodeURIComponent(name).replace(/%2C/g, ',').replace(/%28/g, '(').replace(/%29/g, ')').replace(/%27/g, "'");

export function commonsThumb(file, width) {
  const name = file.replace(/ /g, '_').normalize('NFC');
  const h = md5(name);
  const e = enc(name);
  const ext = name.split('.').pop().toLowerCase();
  const suffix = ext === 'tif' || ext === 'tiff' ? '.jpg' : '';
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${h[0]}/${h.slice(0, 2)}/${e}/${width}px-${e}${suffix}`;
}

export const commonsFallback = (file, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${enc(file.replace(/ /g, '_'))}?width=${width}`;

export const commonsPage = (file) => `https://commons.wikimedia.org/wiki/File:${enc(file.replace(/ /g, '_'))}`;

/** Returns {src, srcSet, fallback, page} for a registry photo id. */
export function photoSources(id, sizes = 'card') {
  const p = photos[id];
  if (!p) return null;
  if (p.src) return { src: p.src, srcSet: undefined, fallback: null, page: p.page || null };
  const widths = sizes === 'hero' ? [960, 1280, 1920] : sizes === 'thumb' ? [500, 960] : [500, 960, 1280];
  return {
    src: commonsThumb(p.file, widths[1]),
    srcSet: widths.map((w) => `${commonsThumb(p.file, w)} ${w}w`).join(', '),
    fallback: commonsFallback(p.file, widths.at(-1)),
    page: commonsPage(p.file),
  };
}

// ── Live credits from the Commons API ──────────────────────────────────────
const CACHE_KEY = 'es27-credits-v1';
let creditPromise = null;
const listeners = new Set();
export let credits = {};

try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (cached && Date.now() - cached.t < 7 * 864e5) credits = cached.data;
} catch { /* storage unavailable */ }

const strip = (html) => {
  if (!html) return '';
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent || '').replace(/\s+/g, ' ').trim();
};

export function onCredits(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function loadCredits() {
  if (creditPromise) return creditPromise;
  const files = [...new Set(Object.values(photos).filter((p) => p.file && !credits[p.file]).map((p) => p.file))];
  if (!files.length) return (creditPromise = Promise.resolve(credits));
  const batches = [];
  for (let i = 0; i < files.length; i += 45) batches.push(files.slice(i, i + 45));
  creditPromise = Promise.all(batches.map(async (batch) => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo' +
      '&iiprop=extmetadata|size&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl|Credit&titles=' +
      encodeURIComponent(batch.map((f) => 'File:' + f.replace(/_/g, ' ')).join('|'));
    const res = await fetch(url);
    const json = await res.json();
    const norm = Object.fromEntries((json.query?.normalized || []).map((n) => [n.to, n.from]));
    for (const page of Object.values(json.query?.pages || {})) {
      const asked = (norm[page.title] || page.title).replace(/^File:/, '').replace(/ /g, '_');
      const file = batch.find((f) => f.replace(/ /g, '_').normalize('NFC') === asked.normalize('NFC')) || asked;
      if (page.missing !== undefined) { credits[file] = { missing: true }; continue; }
      const info = page.imageinfo?.[0];
      const m = info?.extmetadata || {};
      credits[file] = {
        author: strip(m.Artist?.value) || 'Unknown author',
        license: strip(m.LicenseShortName?.value) || 'See file page',
        licenseUrl: m.LicenseUrl?.value || null,
        width: info?.width, height: info?.height,
      };
    }
  })).then(() => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: credits })); } catch { /* ignore */ }
    listeners.forEach((fn) => fn(credits));
    return credits;
  }).catch(() => credits);
  return creditPromise;
}
