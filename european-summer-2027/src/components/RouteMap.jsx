import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator } from 'd3-geo';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { line, curveCatmullRom } from 'd3-shape';
import 'd3-transition';
import basemap from '../data/basemap.json';
import { places, journeys, destinations } from '../data/trip.js';
import { dateRange } from '../lib/format.js';
import { useReducedMotion } from '../lib/hooks.js';

const proj = geoMercator().rotate(basemap.projection.rotate).scale(basemap.projection.scale).translate(basemap.projection.translate);
const P = (latlon) => proj([latlon[1], latlon[0]]);

const ORDER = ['vienna-tgd', 'tgd-kotor', 'kotor-budva', 'budva-shkoder', 'shkoder-theth', 'theth-tirana', 'tirana-berat', 'berat-himare', 'himare-ksamil', 'ksamil-sarande', 'sarande-corfu'];

const roadLine = line().curve(curveCatmullRom.alpha(0.5));

function buildRoutes() {
  return ORDER.map((id) => {
    const j = journeys[id];
    let d;
    if (j.path === 'arc') {
      const a = P(places[j.from_place].coord); const b = P(places[j.to_place].coord);
      const mx = (a[0] + b[0]) / 2; const my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0]; const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy);
      const cx = mx + (-dy / len) * len * 0.22; const cy = my + (dx / len) * len * 0.22;
      d = `M${a[0]},${a[1]} Q${cx},${cy} ${b[0]},${b[1]}`;
    } else {
      d = roadLine(j.path.map(P));
    }
    return { id, mode: j.mode, d };
  });
}

// Label placement per stop: [dx, dy, anchor]
const LABELS = {
  vienna: [10, 4, 'start'], tgd: [9, 12, 'start'], kotor: [-10, -4, 'end'], budva: [-10, 10, 'end'],
  shkoder: [10, 4, 'start'], theth: [10, -2, 'start'], tirana: [10, 4, 'start'], berat: [10, 4, 'start'],
  himare: [-10, 4, 'end'], ksamil: [10, 10, 'start'], sarandePort: [10, -2, 'start'], corfu: [-10, 6, 'end'],
};

const STOPS = [
  ...destinations.map((d) => ({ key: d.place, id: d.id, name: d.name, sub: d.nights ? dateRange(d.checkIn, d.checkOut) : 'Arrive 14 August', main: true })),
  { key: 'tgd', id: 'kotor', name: 'Podgorica Airport', sub: 'Land 26 July', main: false },
  { key: 'sarandePort', id: 'ksamil', name: 'Sarandë Port', sub: 'Ferry 14 August', main: false },
];

const Basemap = memo(function Basemap() {
  return (
    <g>
      <rect x={-4000} y={-4000} width={basemap.width + 8000} height={basemap.height + 8000} className="map-sea" />
      {basemap.land.map((c) => <path key={c.iso} d={c.d} className="map-land" />)}
      {basemap.focus.map((c) => <path key={c.iso} d={c.d} className="map-land map-land--focus" />)}
      {basemap.lakes.map((d, i) => <path key={i} d={d} className="map-lake" />)}
    </g>
  );
});

const COUNTRY_LABELS = [
  { name: 'AUSTRIA', at: [47.55, 14.4] }, { name: 'MONTENEGRO', at: [42.78, 19.05] },
  { name: 'ALBANIA', at: [40.95, 20.25] }, { name: 'GREECE', at: [39.45, 21.3] },
  { name: 'Adriatic Sea', at: [41.9, 17.4], sea: true }, { name: 'Ionian Sea', at: [38.95, 19.2], sea: true },
];

export function RouteMap() {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 700 });
  const [t, setT] = useState({ k: 0.4, x: 0, y: 0 });
  const [hover, setHover] = useState(null);
  const [view, setView] = useState('all');
  const reduced = useReducedMotion();
  const routes = useMemo(buildRoutes, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fit = useCallback((which, animate = true) => {
    const keys = which === 'all' ? Object.keys(places)
      : which === 'balkans' ? Object.keys(places).filter((k) => k !== 'vienna')
      : ['berat', 'himare', 'ksamil', 'sarandePort', 'corfu'];
    const pts = keys.map((k) => P(places[k].coord));
    const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const padX = 90; const padY = 70;
    const k = Math.min((size.w - padX * 2) / Math.max(x1 - x0, 1), (size.h - padY * 2) / Math.max(y1 - y0, 1), 14);
    const tx = size.w / 2 - k * (x0 + x1) / 2; const ty = size.h / 2 - k * (y0 + y1) / 2;
    const target = zoomIdentity.translate(tx, ty).scale(k);
    const sel = select(svgRef.current);
    if (animate && !reduced) sel.transition().duration(900).call(zoomRef.current.transform, target);
    else sel.call(zoomRef.current.transform, target);
    setView(which);
  }, [size, reduced]);

  useEffect(() => {
    const z = d3zoom()
      .scaleExtent([0.25, 40])
      .filter((e) => {
        if (e.type === 'wheel') return e.ctrlKey || e.metaKey;
        if (e.type === 'touchstart') return e.touches.length > 1;
        return !e.button;
      })
      .on('zoom', (e) => setT({ k: e.transform.k, x: e.transform.x, y: e.transform.y }));
    zoomRef.current = z;
    const sel = select(svgRef.current).call(z);
    sel.on('dblclick.zoom', null);
    sel.style('touch-action', 'pan-y');
  }, []);

  useEffect(() => { if (size.w > 50) fit(view, false); }, [size.w, size.h]);

  const zoomBy = (f) => select(svgRef.current).transition().duration(reduced ? 0 : 300).call(zoomRef.current.scaleBy, f);
  const inv = 1 / t.k;

  return (
    <div className="map">
      <div className="map__frame" ref={wrapRef}>
        <svg ref={svgRef} width={size.w} height={size.h} className="map__svg" role="img"
          aria-label="Map of our route: Vienna by air to Podgorica, then by road through Kotor, Budva, Shkodër, Theth, Tirana, Berat, Himarë and Ksamil to Sarandë, and by ferry to Corfu.">
          <defs>
            <filter id="map-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
          </defs>
          <g transform={`translate(${t.x},${t.y}) scale(${t.k})`}>
            <Basemap />
            {COUNTRY_LABELS.filter((c) => c.sea || t.k > 0.75).map((c) => {
              const [x, y] = P(c.at);
              return <text key={c.name} x={x} y={y} transform={`translate(${x},${y}) scale(${inv}) translate(${-x},${-y})`} className={c.sea ? 'map-sealabel' : 'map-countrylabel'} textAnchor="middle">{c.name}</text>;
            })}
            {routes.map((r) => (
              <g key={r.id} className={`map-route map-route--${r.mode}`}>
                {r.mode === 'road' && <path d={r.d} className="map-route__casing" vectorEffect="non-scaling-stroke" />}
                <path d={r.d} className="map-route__line" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            {STOPS.map((s) => {
              const [x, y] = P(places[s.key].coord);
              const [dx, dy, anchor] = LABELS[s.key] || [10, 4, 'start'];
              const showLabel = s.main || t.k > 0.75 || hover === s.key;
              return (
                <a key={s.key} href={`#${s.id}`} className={`map-stop ${s.main ? '' : 'map-stop--minor'}`}
                  transform={`translate(${x},${y}) scale(${inv})`}
                  onMouseEnter={() => setHover(s.key)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(s.key)} onBlur={() => setHover(null)}
                  aria-label={`${s.name}, ${s.sub}`}>
                  <circle r={s.main ? 11 : 9} className="map-stop__halo" />
                  <circle r={s.main ? 5.5 : 4} className="map-stop__dot" />
                  {showLabel && <text x={dx} y={dy} textAnchor={anchor} className="map-stop__label">{s.name}</text>}
                  {hover === s.key && <text x={dx} y={dy + 14} textAnchor={anchor} className="map-stop__sub">{s.sub}</text>}
                </a>
              );
            })}
          </g>
        </svg>
        <div className="map__controls">
          <button className="map__btn" onClick={() => zoomBy(1.6)} aria-label="Zoom in">+</button>
          <button className="map__btn" onClick={() => zoomBy(1 / 1.6)} aria-label="Zoom out">−</button>
        </div>
        <p className="map__hint">Drag to move · pinch or ctrl + scroll to zoom</p>
      </div>
      <div className="map__views" role="group" aria-label="Map view">
        {[['all', 'Whole route'], ['balkans', 'Montenegro & Albania'], ['riviera', 'Riviera to Corfu']].map(([k, label]) => (
          <button key={k} className={`chip ${view === k ? 'is-active' : ''}`} aria-pressed={view === k} onClick={() => fit(k)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

export function MapLegend() {
  return (
    <ul className="legend">
      <li><svg width="44" height="12" aria-hidden="true"><path d="M2 9 Q22 -3 42 9" className="legend-flight" /></svg> Flight</li>
      <li><svg width="44" height="12" aria-hidden="true"><path d="M2 6 H42" className="legend-road-casing" /><path d="M2 6 H42" className="legend-road" /></svg> Road · car, bus or transfer</li>
      <li><svg width="44" height="12" aria-hidden="true"><path d="M2 6 H42" className="legend-ferry" /></svg> Ferry</li>
    </ul>
  );
}
