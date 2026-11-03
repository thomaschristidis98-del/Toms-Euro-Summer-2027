import React from 'react';
import { trip, destinations } from '../data/trip.js';
import { Photo } from './Photo.jsx';
import { Credit } from './Lightbox.jsx';
import { dayNum, monthShort, nightsLabel } from '../lib/format.js';

export function Hero() {
  return (
    <section id="top" className="hero">
      <Photo id="home-hero" size="hero" eager className="hero__photo" imgClassName="hero__img" position="50% 60%" />
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content gutter">
        <p className="hero__flags" aria-label={trip.countries.map((c) => c.name).join(', ')}>
          {trip.countries.map((c) => (
            <span key={c.code} className="hero__flag"><span aria-hidden="true">{c.flag}</span> {c.name}</span>
          ))}
        </p>
        <h1 className="hero__title">
          <span className="hero__title-line">European</span>
          <span className="hero__title-line hero__title-line--indent">Summer <em>2027</em></span>
        </h1>
        <p className="hero__sub">{trip.subtitle}</p>
        <p className="hero__dates">24 July – 27 August 2027 <span aria-hidden="true">·</span> {trip.totalNights} nights in Europe</p>
        <a href="#route" className="btn btn--light hero__cta">
          Explore our journey
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
        </a>
      </div>
      <Credit id="home-hero" className="hero__credit gutter" />
    </section>
  );
}

export function Timeline() {
  const stops = [
    ...destinations.map((d) => ({ id: d.id, name: d.name, flag: d.flag, date: d.checkIn, nights: d.nights, country: d.country })),
    { id: 'greece', name: 'Greece', flag: '🇬🇷', date: '2027-08-14', nights: 13, country: 'To be confirmed', tbc: true },
  ];
  return (
    <section className="timeline-wrap gutter" aria-labelledby="tl-title">
      <div className="timeline-head">
        <p className="eyebrow">The itinerary</p>
        <h2 id="tl-title" className="display-2">Ten stops, four countries</h2>
        <p className="lede">{trip.arrival.text}</p>
      </div>
      <ol className="timeline">
        {stops.map((s, i) => (
          <li key={s.id} className={`timeline__stop ${s.tbc ? 'is-tbc' : ''}`}>
            <a href={`#${s.id}`} className="timeline__link">
              <span className="timeline__date"><b>{dayNum(s.date)}</b> {monthShort(s.date)}</span>
              <span className="timeline__dot" aria-hidden="true" />
              <span className="timeline__name"><span aria-hidden="true">{s.flag}</span> {s.name}</span>
              <span className="timeline__nights">{s.tbc ? '13 nights · TBC' : s.id === 'corfu' ? 'Arrival' : nightsLabel(s.nights)}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
