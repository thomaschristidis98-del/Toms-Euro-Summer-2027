import React, { useEffect, useRef, useState } from 'react';
import { trip, greece, destinations } from '../data/trip.js';
import { photos } from '../data/photos.js';
import { Photo } from './Photo.jsx';
import { useLightbox, useCredits, Credit } from './Lightbox.jsx';
import { RouteMap, MapLegend } from './RouteMap.jsx';
import { useReducedMotion } from '../lib/hooks.js';
import { loadCredits, commonsPage } from '../lib/commons.js';

const placeOf = (photoId) => destinations.find((d) => d.hero === photoId || d.attractions.some((a) => a.photo === photoId));

export function RouteSection() {
  return (
    <section id="route" className="route" aria-labelledby="route-title">
      <div className="route__inner gutter">
        <div className="route__text">
          <p className="eyebrow eyebrow--light">The route</p>
          <h2 id="route-title" className="display-2 display-2--light">By air, by road, by sea</h2>
          <p className="route__lede">One short flight from Vienna, then three weeks of road trip from the Bay of Kotor to the tip of Albania, and a ferry across to Corfu.</p>
          <MapLegend />
          <ol className="route__legs">
            <li><b>26 Jul</b> Vienna → Podgorica <span>Flight</span></li>
            <li><b>26 Jul – 11 Aug</b> Kotor to Ksamil <span>Road</span></li>
            <li><b>14 Aug</b> Sarandë → Corfu <span>Ferry</span></li>
          </ol>
        </div>
        <RouteMap />
      </div>
    </section>
  );
}

export function Highlights() {
  const ids = trip.homeCarousel;
  const { open } = useLightbox();
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const reduced = useReducedMotion();
  const paused = useRef(false);

  const go = (i) => {
    const el = trackRef.current; if (!el) return;
    const n = (i + ids.length) % ids.length;
    const slide = el.children[n];
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    const fn = () => {
      const w = el.children[0]?.getBoundingClientRect().width || 1;
      setIdx(Math.round(el.scrollLeft / (w + 16)));
    };
    el.addEventListener('scroll', fn, { passive: true });
    return () => el.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => { if (!paused.current && document.visibilityState === 'visible') go(idx + 1); }, 6000);
    return () => clearInterval(t);
  }, [idx, reduced]);

  return (
    <section className="highlights" aria-labelledby="hl-title"
      onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}
      onFocus={() => { paused.current = true; }} onTouchStart={() => { paused.current = true; }}>
      <div className="highlights__head gutter">
        <div>
          <p className="eyebrow">Highlights</p>
          <h2 id="hl-title" className="display-2">A glimpse of the summer</h2>
        </div>
        <div className="highlights__nav">
          <button className="round-btn" onClick={() => go(idx - 1)} aria-label="Previous highlight">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </button>
          <button className="round-btn" onClick={() => go(idx + 1)} aria-label="Next highlight">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      <div className="highlights__track gutter" ref={trackRef} tabIndex={0} aria-label="Highlight photos, swipe to see more">
        {ids.map((id, i) => {
          const d = placeOf(id);
          return (
            <figure key={id} className="highlight">
              <button className="highlight__btn" onClick={() => open(ids.map((x) => ({ id: x })), i)} aria-label={`Enlarge ${photos[id].caption}`}>
                <Photo id={id} size="hero" sizes="(min-width: 1024px) 60vw, 88vw" className="highlight__photo" imgClassName="highlight__img" />
              </button>
              <figcaption className="highlight__cap">
                <span className="highlight__title">{photos[id].caption}</span>
                {d && <a href={`#${d.id}`} className="highlight__where">{d.flag} {d.name}</a>}
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div className="highlights__dots" aria-hidden="true">
        {ids.map((id, i) => <span key={id} className={i === idx ? 'is-active' : ''} />)}
      </div>
    </section>
  );
}

export function Finale() {
  return (
    <section id="greece" className="finale" aria-labelledby="finale-title">
      <Photo id={greece.photo} size="hero" className="finale__photo" imgClassName="finale__img" />
      <div className="finale__shade" aria-hidden="true" />
      <div className="finale__content gutter">
        <p className="eyebrow eyebrow--light"><span aria-hidden="true">🇬🇷</span> Greece</p>
        <h2 id="finale-title" className="finale__title">{greece.heading}</h2>
        <p className="finale__sub">{greece.subheading}</p>
        <p className="finale__dates">{greece.dates}</p>
        <p className="finale__line">{greece.line}</p>
        <p className="finale__end">
          <span className="finale__end-label">Departing from</span>
          <span className="finale__end-city">{greece.endpoint}</span>
        </p>
      </div>
      <Credit id={greece.photo} className="dest__credit" />
    </section>
  );
}

export function Credits() {
  const all = useCredits();
  const [openList, setOpenList] = useState(false);
  useEffect(() => { if (openList) loadCredits(); }, [openList]);
  const used = Object.entries(photos);
  return (
    <section className="credits gutter" aria-labelledby="credits-title">
      <div className="credits__head">
        <h2 id="credits-title" className="credits__title">Photography</h2>
        <p className="credits__text">Destination photographs are from Wikimedia Commons and used under their free licences. Each photo’s author and licence appear when you open it.</p>
        <button className="btn btn--ghost btn--small" aria-expanded={openList} onClick={() => setOpenList((v) => !v)}>
          {openList ? 'Hide full credits' : 'Show full credits'}
        </button>
      </div>
      {openList && (
        <ul className="credits__list">
          {used.map(([id, p]) => {
            const c = p.file ? all[p.file] : null;
            return (
              <li key={id}>
                <span className="credits__cap">{p.caption}</span>
                <span className="credits__by">
                  {c?.missing ? 'File not found on Commons' : c ? `${c.author} · ${c.license}` : 'Loading credit…'}
                </span>
                {p.file && <a href={commonsPage(p.file)} target="_blank" rel="noopener noreferrer">Source</a>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer gutter">
      <p className="footer__mark">European Summer 2027</p>
      <p className="footer__line">Vienna · Kotor · Budva · Shkodër · Theth · Tirana · Berat · Himarë · Ksamil · Corfu · Greece</p>
      <p className="footer__small">Journey times are estimates for planning. Maps and booking links open in a new tab and need an internet connection.</p>
    </footer>
  );
}

/** Visible only at #owner: lets the trip owner review every photo and its label. */
export function OwnerPanel() {
  const all = useCredits();
  useEffect(() => { loadCredits(); }, []);
  const { open } = useLightbox();
  const entries = Object.entries(photos);
  return (
    <section className="owner gutter" aria-labelledby="owner-title">
      <h2 id="owner-title" className="display-2">Owner tools</h2>
      <p className="owner__text">Only shown at <code>#owner</code>. Check each photo matches its label, then mark it <code>verified: 'visual'</code> in <code>src/data/photos.js</code>. Hotel sections now show an “Add photos to preview” button; previews stay on this device.</p>
      <ul className="owner__grid">
        {entries.map(([id, p], i) => {
          const c = p.file ? all[p.file] : null;
          return (
            <li key={id} className={`owner__item ${c?.missing ? 'is-missing' : ''}`}>
              <button onClick={() => open(entries.map(([x]) => ({ id: x })), i)} className="owner__thumb" aria-label={`Open ${p.caption}`}>
                <Photo id={id} size="thumb" className="owner__photo" />
              </button>
              <p className="owner__cap">{p.caption}</p>
              <p className="owner__meta">{id} · {p.verified === 'visual' ? 'checked' : 'check visually'}{c?.missing ? ' · NOT FOUND' : ''}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
