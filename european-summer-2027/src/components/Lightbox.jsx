import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { photos } from '../data/photos.js';
import { credits, loadCredits, onCredits, commonsPage } from '../lib/commons.js';
import { Photo } from './Photo.jsx';

const Ctx = createContext({ open: () => {} });
export const useLightbox = () => useContext(Ctx);

export function useCredits() {
  const [, set] = useState(0);
  useEffect(() => onCredits(() => set((n) => n + 1)), []);
  return credits;
}

export function Credit({ id, className = '' }) {
  const all = useCredits();
  const p = photos[id];
  if (!p) return null;
  if (!p.file) return <span className={className}>{p.credit || ''}{p.license ? ` · ${p.license}` : ''}</span>;
  const c = all[p.file];
  return (
    <span className={className}>
      {c && !c.missing ? <>Photo: {c.author} · </> : null}
      <a href={commonsPage(p.file)} target="_blank" rel="noopener noreferrer" className="underline decoration-1 underline-offset-2">
        {c && !c.missing ? (c.license || 'Wikimedia Commons') : 'Wikimedia Commons · author & licence'}
      </a>
    </span>
  );
}

export function LightboxProvider({ children }) {
  const [state, setState] = useState(null); // {items, index}
  const open = useCallback((items, index = 0) => { loadCredits(); setState({ items, index }); }, []);
  const close = useCallback(() => setState(null), []);
  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {state && <Lightbox {...state} onClose={close} onIndex={(index) => setState((s) => ({ ...s, index }))} />}
    </Ctx.Provider>
  );
}

function Lightbox({ items, index, onClose, onIndex }) {
  const item = items[index];
  const closeRef = useRef(null);
  const touch = useRef(null);
  const prev = () => onIndex((index - 1 + items.length) % items.length);
  const next = () => onIndex((index + 1) % items.length);

  useEffect(() => {
    const last = document.activeElement;
    closeRef.current?.focus();
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = overflow; last?.focus?.(); };
  }, [index]);

  const caption = item.caption || photos[item.id]?.caption;
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={caption || 'Photo'}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) (dx < 0 ? next : prev)(); touch.current = null; }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lightbox__bar">
        <span className="lightbox__count">{index + 1} / {items.length}</span>
        <button ref={closeRef} className="lightbox__btn" onClick={onClose} aria-label="Close photo">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
        </button>
      </div>
      <figure className="lightbox__figure" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        {item.url
          ? <img src={item.url} alt={item.caption || 'Uploaded photo'} className="lightbox__img" />
          : <Photo key={item.id} id={item.id} size="hero" sizes="100vw" className="lightbox__photo" imgClassName="lightbox__img" eager />}
        <figcaption className="lightbox__caption">
          <span className="lightbox__title">{caption}</span>
          {item.id && <Credit id={item.id} className="lightbox__credit" />}
        </figcaption>
      </figure>
      {items.length > 1 && <>
        <button className="lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous photo">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
        </button>
        <button className="lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next photo">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
        </button>
      </>}
    </div>
  );
}
