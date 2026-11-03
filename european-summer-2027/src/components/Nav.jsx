import React, { useEffect, useRef, useState } from 'react';
import { destinations, trip } from '../data/trip.js';
import { useActiveSection } from '../lib/hooks.js';

const SECTIONS = ['top', 'route', ...destinations.map((d) => d.id), 'greece'];

export function Nav() {
  const active = useActiveSection(SECTIONS);
  const [solid, setSolid] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Keep the active chip visible inside the scrolling chip row.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-id="${active}"]`);
    if (el && listRef.current) {
      const box = listRef.current;
      const left = el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2;
      box.scrollTo({ left, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <header className={`nav ${solid ? 'nav--solid' : ''}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__mark" aria-label={`${trip.title}, back to top`}>
          <span className="nav__mark-big">ES</span><span className="nav__mark-yr">’27</span>
        </a>
        <nav aria-label="Destinations" className="nav__list" ref={listRef}>
          <a href="#route" data-id="route" className={`nav__chip ${active === 'route' ? 'is-active' : ''}`}>Route</a>
          {destinations.map((d) => (
            <a key={d.id} href={`#${d.id}`} data-id={d.id} className={`nav__chip ${active === d.id ? 'is-active' : ''}`}>
              {d.name}
            </a>
          ))}
          <a href="#greece" data-id="greece" className={`nav__chip ${active === 'greece' ? 'is-active' : ''}`}>Greece</a>
        </nav>
      </div>
    </header>
  );
}
