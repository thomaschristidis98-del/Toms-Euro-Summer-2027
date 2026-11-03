import React, { useEffect, useRef, useState } from 'react';
import { photos } from '../data/photos.js';
import { Photo, PhotoPlaceholder } from './Photo.jsx';
import { useLightbox, Credit } from './Lightbox.jsx';
import { Journey, ModeIcon } from './Transition.jsx';
import { journeys } from '../data/trip.js';
import { dateRange, nightsLabel, weekdayDayMonth } from '../lib/format.js';
import { useInView } from '../lib/hooks.js';
import { listLocal, addLocal, removeLocal, onLocalChange } from '../lib/localPhotos.js';

export function Destination({ d, index, owner }) {
  const [ref, inView] = useInView();
  const { open } = useLightbox();
  const attractionItems = d.attractions.map((a) => ({ id: a.photo, caption: a.name }));

  return (
    <>
      <section id={d.id} className={`dest ${inView ? 'in-view' : ''} ${d.preview ? 'dest--preview' : ''}`} ref={ref} aria-labelledby={`${d.id}-title`}>
        <div className="dest__hero">
          <button className="dest__hero-btn" onClick={() => open([{ id: d.hero }], 0)} aria-label={`View photo: ${photos[d.hero]?.caption}`}>
            <Photo id={d.hero} size="hero" className="dest__hero-photo" imgClassName="dest__hero-img" />
          </button>
          <div className="dest__hero-shade" aria-hidden="true" />
          <div className="dest__hero-text gutter">
            <p className="dest__index">
              <span className="dest__num">{String(index + 1).padStart(2, '0')}</span>
              <span>{d.kicker}</span>
            </p>
            <h2 id={`${d.id}-title`} className="dest__name">{d.name}</h2>
            <p className="dest__facts">
              <span><span aria-hidden="true">{d.flag}</span> {d.country}</span>
              <span className="dest__sep" aria-hidden="true" />
              <span>{dateRange(d.checkIn, d.checkOut)}</span>
              <span className="dest__sep" aria-hidden="true" />
              <span>{d.preview ? 'Arriving 14 August' : nightsLabel(d.nights)}</span>
            </p>
          </div>
          <Credit id={d.hero} className="dest__credit" />
        </div>

        <div className="dest__body gutter">
          <div className="dest__lead">
            <p className="dest__intro">{d.intro}</p>
            <AtAGlance d={d} />
          </div>
          <Stay d={d} owner={owner} />
          <div className="explore">
            <div className="explore__head">
              <p className="eyebrow">What we’re exploring</p>
              <p className="explore__count">{d.attractions.length} highlights</p>
            </div>
            <ul className={`explore__grid explore__grid--${d.attractions.length}`}>
              {d.attractions.map((a, i) => (
                <li key={a.name} className="spot">
                  <button className="spot__photo-btn" onClick={() => open(attractionItems, i)} aria-label={`Enlarge photo of ${a.name}`}>
                    <Photo id={a.photo} className="spot__photo" imgClassName="spot__img" />
                    <span className="spot__zoom" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
                    </span>
                  </button>
                  <div className="spot__text">
                    <h3 className="spot__name">{a.name}</h3>
                    <p className="spot__desc">{a.text}</p>
                    <a className="spot__map" href={a.maps} target="_blank" rel="noopener noreferrer">
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" fill="none" /><circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
                      Google Maps
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {d.next.length > 0 && <Journey ids={d.next} />}
    </>
  );
}

function AtAGlance({ d }) {
  const next = d.next.map((id) => journeys[id]);
  return (
    <dl className="glance">
      <div><dt>Arrive</dt><dd>{weekdayDayMonth(d.checkIn)}</dd></div>
      <div><dt>Leave</dt><dd>{d.checkOut ? weekdayDayMonth(d.checkOut) : 'To be confirmed'}</dd></div>
      <div className="glance__next">
        <dt>Then</dt>
        <dd>
          {next.length ? next.map((j) => (
            <span key={j.to} className="glance__leg"><ModeIcon mode={j.mode} vehicle={j.vehicle} size={15} /> {j.to} <small>{j.duration.replace('Approx. ', '~')}</small></span>
          )) : <span className="glance__leg">Onward through Greece, TBC</span>}
        </dd>
      </div>
    </dl>
  );
}

function Stay({ d, owner }) {
  const h = d.hotel;
  const [local, setLocal] = useState([]);
  const { open } = useLightbox();

  useEffect(() => {
    if (!h.name) return;
    let alive = true;
    const load = () => listLocal(d.id).then((l) => alive && setLocal(l));
    load();
    const off = onLocalChange((id) => id === d.id && load());
    return () => { alive = false; off(); };
  }, [d.id]);

  if (!h.name) {
    return (
      <div className="stay stay--tba">
        <p className="eyebrow">Where we’re staying</p>
        <p className="stay__tba">{d.preview ? 'Our Corfu accommodation is still to be announced.' : 'Accommodation to be announced.'}</p>
      </div>
    );
  }

  // Published photos (from trip.js) first, then this browser's previews in owner mode.
  const published = (h.photos || []).map((p) => (typeof p === 'string' ? { url: p, caption: h.name } : { url: p.src, caption: p.caption || h.name }));
  const items = [...published, ...(owner ? local.map((l) => ({ url: l.url, caption: `${h.name} (preview on this device)`, localId: l.id })) : [])];

  return (
    <div className="stay">
      <div className="stay__gallery">
        {items.length ? (
          <div className="stay__strip" tabIndex={0} aria-label={`${h.name} photos, swipe to see more`}>
            {items.map((it, i) => (
              <figure key={it.url} className="stay__slide">
                <button onClick={() => open(items, i)} className="stay__slide-btn" aria-label={`Enlarge photo ${i + 1} of ${items.length}`}>
                  <img src={it.url} alt={it.caption} loading="lazy" />
                </button>
                {owner && it.localId && <button className="stay__remove" onClick={() => removeLocal(it.localId, d.id)}>Remove</button>}
              </figure>
            ))}
          </div>
        ) : (
          <PhotoPlaceholder className="stay__placeholder" label={h.name} note="Property photos coming soon">
            <a className="stay__ph-link" href={h.url} target="_blank" rel="noopener noreferrer">See the listing photos on Booking.com</a>
          </PhotoPlaceholder>
        )}
        {owner && <OwnerUpload destId={d.id} />}
      </div>
      <div className="stay__info">
        <p className="eyebrow">Where we’re staying</p>
        <h3 className="stay__name">{h.name}</h3>
        <p className="stay__type">{h.type} · {d.name}, {d.country}</p>
        <p className="stay__blurb">{h.blurb}</p>
        <ul className="stay__features">{h.features.map((f) => <li key={f}>{f}</li>)}</ul>
        <dl className="stay__dates">
          <div><dt>Check in</dt><dd>{weekdayDayMonth(d.checkIn)}</dd></div>
          <div><dt>Check out</dt><dd>{weekdayDayMonth(d.checkOut)}</dd></div>
          <div><dt>Stay</dt><dd>{nightsLabel(d.nights)}</dd></div>
        </dl>
        <div className="stay__actions">
          <a className="btn btn--dark" href={h.url} target="_blank" rel="noopener noreferrer">View on Booking.com</a>
          <a className="btn btn--ghost" href={h.maps} target="_blank" rel="noopener noreferrer">Map</a>
        </div>
      </div>
    </div>
  );
}

function OwnerUpload({ destId }) {
  const input = useRef(null);
  return (
    <div className="owner-upload">
      <input ref={input} id={`upload-${destId}`} type="file" accept="image/*" multiple className="sr-only"
        onChange={(e) => { addLocal(destId, [...e.target.files]); e.target.value = ''; }} />
      <label htmlFor={`upload-${destId}`} className="btn btn--ghost btn--small">Add photos to preview</label>
      <span className="owner-upload__note">Saved on this device only. See README to publish.</span>
    </div>
  );
}
