import React, { useEffect, useId, useRef, useState } from 'react';
import { journeys } from '../data/trip.js';
import { weekdayDayMonth } from '../lib/format.js';
import { useInView, useReducedMotion } from '../lib/hooks.js';

// Scenery per road journey.
const SCENE = {
  'tgd-kotor': 'mountain', 'kotor-budva': 'coast', 'budva-shkoder': 'coast', 'shkoder-theth': 'alpine',
  'theth-tirana': 'mountain', 'tirana-berat': 'hills', 'berat-himare': 'mountain', 'himare-ksamil': 'coast', 'ksamil-sarande': 'coast',
};

const ROAD = 'M-120 324 C 60 324, 130 270, 250 274 S 470 342, 590 308 S 760 266, 920 272';
const FLIGHT = 'M70 300 Q 400 30 730 300';
const FERRY = 'M110 292 C 260 270, 520 270, 690 292';

export function Journey({ ids }) {
  return (
    <div className="journey gutter" aria-label="Travel to the next destination">
      {ids.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && <div className="journey__then" aria-hidden="true"><span>then</span></div>}
          <TransitionCard id={id} />
        </React.Fragment>
      ))}
    </div>
  );
}

function TransitionCard({ id }) {
  const j = journeys[id];
  const [ref, inView] = useInView({ rootMargin: '0px', threshold: 0 }, false);
  const reduced = useReducedMotion();
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const [still, setStill] = useState(null);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg?.pauseAnimations) return;
    if (inView && !reduced) svg.unpauseAnimations(); else svg.pauseAnimations();
  }, [inView, reduced]);

  useEffect(() => {
    if (!reduced || !pathRef.current) return;
    const p = pathRef.current;
    const L = p.getTotalLength();
    const a = p.getPointAtLength(L * 0.58); const b = p.getPointAtLength(L * 0.6);
    setStill({ x: a.x, y: a.y, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
  }, [reduced]);

  const mode = j.mode;
  const path = mode === 'flight' ? FLIGHT : mode === 'ferry' ? FERRY : ROAD;
  const scene = mode === 'road' ? SCENE[id] || 'hills' : mode;
  const dur = mode === 'flight' ? '7s' : mode === 'ferry' ? '9s' : j.vehicle === 'bus' ? '9s' : '7.5s';
  const Vehicle = mode === 'flight' ? Plane : mode === 'ferry' ? Ferry : j.vehicle === 'bus' ? Bus : Car;
  const modeLabel = mode === 'flight' ? 'Flight' : mode === 'ferry' ? 'Ferry' : j.vehicle === 'bus' ? 'Bus or transfer' : 'Road';

  return (
    <article ref={ref} className={`transit transit--${mode} transit--${scene} ${inView ? 'in-view' : ''}`}>
      <div className="transit__scene">
        <svg ref={svgRef} viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet" className="transit__svg" aria-hidden="true">
          <Scenery scene={scene} uid={uid} />
          {mode === 'road' && <>
            <path d={ROAD} className="road-edge" />
            <path d={ROAD} className="road-surface" />
            <path d={ROAD} className="road-centre" />
          </>}
          <path ref={pathRef} d={path} className={`transit__path transit__path--${mode}`} />
          {mode !== 'road' && <>
            <circle cx={mode === 'flight' ? 70 : 110} cy={mode === 'flight' ? 300 : 292} r="5" className="transit__pin" />
            <circle cx={mode === 'flight' ? 730 : 690} cy={mode === 'flight' ? 300 : 292} r="5" className="transit__pin" />
          </>}
          {reduced
            ? still && <g transform={`translate(${still.x},${still.y}) rotate(${mode === 'ferry' ? 0 : still.angle})`}><Vehicle /></g>
            : (
              <g>
                <Vehicle />
                <animateMotion dur={dur} repeatCount="indefinite" rotate={mode === 'ferry' ? '0' : 'auto'} path={path}
                  keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
              </g>
            )}
          {mode === 'road' && <ForegroundScenery scene={scene} />}
        </svg>
      </div>
      <div className="transit__caption">
        <p className="transit__meta">
          <ModeIcon mode={mode} vehicle={j.vehicle} />
          <span>{modeLabel}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={j.date}>{weekdayDayMonth(j.date)}</time>
        </p>
        <h3 className="transit__route">
          <span>{j.from}</span>
          <span className="transit__arrow" aria-label="to">→</span>
          <span>{j.to}</span>
        </h3>
        <p className="transit__line">
          {j.label} <span aria-hidden="true">•</span> <strong>{j.duration}</strong>
        </p>
        {j.detail && <p className="transit__detail">{j.detail}</p>}
        <p className="transit__note">{j.note}</p>
        {j.routeUrl && (
          <a className="transit__link" href={j.routeUrl} target="_blank" rel="noopener noreferrer">
            View route
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </a>
        )}
      </div>
    </article>
  );
}

function Scenery({ scene, uid }) {
  const sky = `sky-${uid}`; const sea = `sea-${uid}`;
  if (scene === 'flight') {
    return (
      <g>
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fc3cf" /><stop offset=".65" stopColor="#dfe9e6" /><stop offset="1" stopColor="#f6efe1" />
          </linearGradient>
        </defs>
        <rect x="-1200" y="-200" width="3200" height="800" fill={`url(#${sky})`} />
        <g className="clouds clouds--back"><Cloud x={-80} y={110} s={1.4} /><Cloud x={300} y={70} s={1} /><Cloud x={640} y={130} s={1.6} /><Cloud x={980} y={90} s={1.2} /></g>
        <g className="clouds clouds--front"><Cloud x={120} y={250} s={1.8} o={0.9} /><Cloud x={520} y={300} s={2.2} o={0.95} /><Cloud x={900} y={260} s={1.7} o={0.9} /></g>
      </g>
    );
  }
  if (scene === 'ferry') {
    return (
      <g>
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bcd8db" /><stop offset="1" stopColor="#f3ecdc" /></linearGradient>
          <linearGradient id={sea} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2aa7ad" /><stop offset="1" stopColor="#0f5e73" /></linearGradient>
        </defs>
        <rect x="-1200" y="-200" width="3200" height="800" fill={`url(#${sky})`} />
        <circle cx="610" cy="96" r="34" fill="#f7e2b3" opacity=".85" />
        <path d="M-1200 252 L-40 252 C 20 214, 70 200, 120 222 C 150 236, 170 246, 190 252 Z" fill="#7d8456" />
        <path d="M600 252 C 640 230, 690 212, 760 218 C 820 222, 880 236, 2000 240 L2000 252 Z" fill="#6b7350" />
        <rect x="-1200" y="250" width="3200" height="600" fill={`url(#${sea})`} />
        <g className="waves">
          {Array.from({ length: 5 }).map((_, i) => (
            <path key={i} className={`wave wave--${i % 3}`} d={wavePath(272 + i * 26)} />
          ))}
        </g>
        <text x="96" y="242" className="scene-label" textAnchor="middle">Albania</text>
        <text x="700" y="210" className="scene-label" textAnchor="middle">Corfu</text>
      </g>
    );
  }
  // Road sceneries
  const palettes = {
    mountain: { sky: ['#cfdcd9', '#f3ecdd'], far: '#9aa6a1', mid: '#7f8a5c', near: '#5e6a40' },
    alpine: { sky: ['#c3d5d8', '#f1ece0'], far: '#a7b0ae', mid: '#6f7c5a', near: '#4f5d37' },
    hills: { sky: ['#dfe2d4', '#f6efe1'], far: '#b8b48c', mid: '#9a9a62', near: '#7b7f47' },
    coast: { sky: ['#cde2e0', '#f6efe1'], far: '#a9b3a3', mid: '#8b8f5c', near: '#6d7445' },
  };
  const c = palettes[scene] || palettes.hills;
  return (
    <g>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.sky[0]} /><stop offset="1" stopColor={c.sky[1]} /></linearGradient>
        <linearGradient id={sea} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3fb2b4" /><stop offset="1" stopColor="#1d7f8e" /></linearGradient>
      </defs>
      <rect x="-1200" y="-200" width="3200" height="800" fill={`url(#${sky})`} />
      <circle cx="640" cy="92" r="30" fill="#f6dfae" opacity=".9" />
      {scene === 'alpine' || scene === 'mountain' ? (
        <>
          <path d="M-1200 230 L-900 120 L-700 200 L-520 90 L-330 210 L-160 70 L20 190 L140 96 L260 180 L380 60 L520 196 L640 104 L760 180 L900 80 L1060 200 L1240 110 L1400 210 L2000 160 L2000 600 L-1200 600Z" fill={c.far} />
          {scene === 'alpine' && <path d="M380 60 L404 84 L392 88 L380 76 L368 90 L356 86Z M-160 70 L-140 92 L-160 86 L-176 94Z M900 80 L922 104 L906 100 L896 108 L884 98Z" fill="#f4f1ea" opacity=".85" />}
          <path d="M-1200 270 C -900 200, -700 260, -500 220 S -200 190, 0 230 S 300 180, 460 226 S 700 196, 900 236 S 1300 210, 2000 240 L2000 600 L-1200 600Z" fill={c.mid} />
        </>
      ) : scene === 'coast' ? (
        <>
          <path d="M-1200 196 C -900 150, -600 176, -300 156 S 100 132, 260 166 S 560 146, 760 170 S 1300 150, 2000 176 L2000 600 L-1200 600Z" fill={c.far} />
          <rect x="-1200" y="200" width="3200" height="70" fill={`url(#${sea})`} />
          <g className="waves waves--soft">{[0, 1].map((i) => <path key={i} className={`wave wave--${i}`} d={wavePath(216 + i * 18)} />)}</g>
          <path d="M-1200 262 C -900 250, -600 258, -300 252 S 100 246, 300 256 S 600 246, 860 258 S 1300 250, 2000 258 L2000 600 L-1200 600Z" fill={c.mid} />
        </>
      ) : (
        <>
          <path d="M-1200 230 C -900 180, -600 220, -300 196 S 100 170, 260 206 S 560 176, 760 210 S 1300 190, 2000 210 L2000 600 L-1200 600Z" fill={c.far} />
          <path d="M-1200 280 C -900 240, -600 270, -300 252 S 100 236, 300 262 S 600 240, 860 268 S 1300 250, 2000 270 L2000 600 L-1200 600Z" fill={c.mid} />
        </>
      )}
      <rect x="-1200" y="330" width="3200" height="300" fill={c.near} />
      <path d="M-1200 330 C -800 316, -400 336, 0 326 S 600 318, 900 330 S 1500 320, 2000 330 L2000 340 L-1200 340Z" fill={c.near} />
    </g>
  );
}

function ForegroundScenery({ scene }) {
  // A few cypress / pine silhouettes in front of the road.
  const tree = scene === 'alpine' || scene === 'mountain' ? '#3f4b2c' : '#4d5733';
  const trees = [[-40, 344, 1], [36, 352, 0.8], [700, 350, 1.1], [760, 356, 0.8], [860, 346, 1]];
  return (
    <g>
      {trees.map(([x, y, s], i) => (
        <path key={i} d={`M${x} ${y} c ${-7 * s} ${-14 * s}, ${-6 * s} ${-40 * s}, 0 ${-58 * s} c ${6 * s} ${18 * s}, ${7 * s} ${44 * s}, 0 ${58 * s}Z`} fill={tree} />
      ))}
    </g>
  );
}

const wavePath = (y) => {
  let d = `M-1200 ${y}`;
  for (let x = -1200; x < 2000; x += 40) d += ` q10 -4 20 0 t20 0`;
  return d;
};

function Cloud({ x, y, s = 1, o = 0.75 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <ellipse cx="0" cy="0" rx="46" ry="14" fill="#fffdf8" />
      <ellipse cx="-14" cy="-10" rx="22" ry="15" fill="#fffdf8" />
      <ellipse cx="14" cy="-14" rx="26" ry="18" fill="#fffdf8" />
    </g>
  );
}

// Vehicles are drawn pointing right (+x), centred on the path.
const Car = () => (
  <g className="vehicle" transform="translate(0 -9)">
    <path d="M-20 4 L-17 -3 Q-14 -6 -8 -7 L4 -7 Q9 -7 13 -2 L18 -1 Q21 0 21 4 L21 6 L-20 6Z" fill="#0f2840" />
    <path d="M-10 -5 L-2 -5 L-2 -1 L-13 -1Z M0 -5 L5 -5 Q8 -5 11 -1 L0 -1Z" fill="#cfe3e3" opacity=".9" />
    <circle cx="-11" cy="7" r="3.6" fill="#1c1c1c" /><circle cx="12" cy="7" r="3.6" fill="#1c1c1c" />
    <circle cx="-11" cy="7" r="1.4" fill="#d9c6a3" /><circle cx="12" cy="7" r="1.4" fill="#d9c6a3" />
  </g>
);
const Bus = () => (
  <g className="vehicle" transform="translate(0 -11)">
    <rect x="-30" y="-9" width="58" height="16" rx="3" fill="#f6efe1" stroke="#0f2840" strokeWidth="1.4" />
    <rect x="-30" y="2" width="58" height="5" fill="#1f8f99" />
    {[-25, -15, -5, 5, 15].map((x) => <rect key={x} x={x} y="-6" width="8" height="6" rx="1" fill="#0f2840" opacity=".85" />)}
    <path d="M24 -6 L27 -6 L27 1 L24 1Z" fill="#0f2840" />
    <circle cx="-18" cy="9" r="3.6" fill="#1c1c1c" /><circle cx="16" cy="9" r="3.6" fill="#1c1c1c" />
  </g>
);
const Plane = () => (
  <g className="vehicle" transform="scale(1.25)">
    <path d="M18 0 C 18 -2, 14 -2.6, 10 -2.6 L-12 -2.6 L-17 -9 L-20 -9 L-16 -2.4 L-18 -2 L-18 2 L-16 2.4 L-20 9 L-17 9 L-12 2.6 L10 2.6 C 14 2.6, 18 2, 18 0Z" fill="#0f2840" />
    <path d="M2 -2.4 L-6 -14 L-2 -14 L8 -2.4Z M2 2.4 L-6 14 L-2 14 L8 2.4Z" fill="#0f2840" />
  </g>
);
const Ferry = () => (
  <g className="vehicle vehicle--ferry" transform="translate(0 -10)">
    <path d="M-34 4 L32 4 L26 14 L-28 14Z" fill="#0f2840" />
    <rect x="-24" y="-6" width="40" height="10" rx="1.5" fill="#f6efe1" />
    <rect x="-16" y="-14" width="24" height="8" rx="1.5" fill="#f6efe1" />
    {[-20, -12, -4, 4].map((x) => <rect key={x} x={x} y="-3" width="5" height="4" rx=".8" fill="#1f8f99" />)}
    <rect x="-4" y="-21" width="5" height="7" fill="#c26a3a" />
    <path d="M-40 16 q8 -3 16 0 t16 0 t16 0 t16 0 t16 0" stroke="#e8f4f2" strokeWidth="1.4" fill="none" opacity=".8" />
  </g>
);

export function ModeIcon({ mode, vehicle, size = 16 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (mode === 'flight') return <svg {...common}><path d="M21 12c0-.8-.7-1.4-1.5-1.4H14L9.5 3H7.5l2.3 7.6H5.4L3.6 8H2l1.2 4L2 16h1.6l1.8-2.6h4.4L7.5 21h2l4.5-7.6h5.5c.8 0 1.5-.6 1.5-1.4z" /></svg>;
  if (mode === 'ferry') return <svg {...common}><path d="M3 15l2 4h14l2-4H3zM6 15V9h12v6M10 9V5h4v4M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1" /></svg>;
  if (vehicle === 'bus') return <svg {...common}><rect x="4" y="3" width="16" height="15" rx="2" /><path d="M4 11h16M8 18v2M16 18v2M8 15h.01M16 15h.01" /></svg>;
  return <svg {...common}><path d="M5 16l1.5-5.2A2 2 0 0 1 8.4 9.4h7.2a2 2 0 0 1 1.9 1.4L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5" /></svg>;
}
