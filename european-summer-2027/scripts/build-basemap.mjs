// Generates src/data/basemap.json from Natural Earth 10m data (public domain).
// Usage: node scripts/build-basemap.mjs <path-to-ne_10m_admin_0_countries.geojson> <path-to-ne_10m_lakes.geojson>
// The output holds pre-projected SVG paths plus the projection parameters, so the
// browser only needs d3-geo to place markers and route lines on top.
import fs from 'node:fs';
import { geoMercator, geoPath } from 'd3-geo';

const [countriesPath, lakesPath] = process.argv.slice(2);
if (!countriesPath || !lakesPath) {
  console.error('Usage: node scripts/build-basemap.mjs <countries.geojson> <lakes.geojson>');
  process.exit(1);
}

const BBOX = { west: 11.5, east: 23.8, south: 38.2, north: 49.4 };
const WIDTH = 1600;

const projection = geoMercator().rotate([-17.6, 0]).center([0, 0]).scale(1).translate([0, 0]);
const [x0] = projection([BBOX.west, BBOX.north]);
const [x1] = projection([BBOX.east, BBOX.south]);
const scale = WIDTH / (x1 - x0);
projection.scale(scale).translate([0, 0]);
const [tlx, tly] = projection([BBOX.west, BBOX.north]);
projection.translate([-tlx, -tly]);
const [, brY] = projection([BBOX.east, BBOX.south]);
const HEIGHT = Math.round(brY);
projection.clipExtent([[-20, -20], [WIDTH + 20, HEIGHT + 20]]);

const path = geoPath(projection).digits(1);
const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
const lakes = JSON.parse(fs.readFileSync(lakesPath, 'utf8'));

const inBox = (f) => {
  const [[a, b], [c, d]] = path.bounds(f);
  return Number.isFinite(a) && c > 0 && a < WIDTH && d > 0 && b < HEIGHT;
};

const FOCUS = new Set(['AUT', 'MNE', 'ALB', 'GRC']);
const land = [];
const focus = [];
const labels = [];
for (const f of countries.features) {
  if (!inBox(f)) continue;
  const iso = f.properties.ADM0_A3;
  const d = path(f);
  if (!d) continue;
  (FOCUS.has(iso) ? focus : land).push({ iso, d });
  const c = path.centroid(f);
  if (Number.isFinite(c[0])) labels.push({ iso, name: f.properties.NAME_EN || f.properties.NAME, x: Math.round(c[0]), y: Math.round(c[1]) });
}
const lakeFeatures = lakes.features.filter((f) => inBox(f) && (f.properties.scalerank ?? 9) <= 6);
const lakePaths = lakeFeatures.map((f) => path(f)).filter(Boolean);

const out = {
  source: 'Natural Earth 1:10m (public domain), naturalearthdata.com',
  width: WIDTH,
  height: HEIGHT,
  projection: { type: 'mercator', rotate: [-17.6, 0], scale, translate: [-tlx, -tly] },
  land,
  focus,
  lakes: lakePaths,
  labels,
};
fs.writeFileSync(new URL('../src/data/basemap.json', import.meta.url), JSON.stringify(out));
console.log('basemap', WIDTH, HEIGHT, 'land', land.length, 'focus', focus.length, 'lakes', lakePaths.length,
  'bytes', JSON.stringify(out).length);
