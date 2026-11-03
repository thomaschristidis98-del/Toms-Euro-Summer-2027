import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

export function useReducedMotion() {
  const q = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  return useSyncExternalStore(
    (cb) => { q?.addEventListener?.('change', cb); return () => q?.removeEventListener?.('change', cb); },
    () => !!q?.matches,
    () => false,
  );
}

/** Adds `in-view` once the element enters the viewport; content is visible regardless. */
export function useInView(options = { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }, once = true) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); if (once) io.disconnect(); }
      else if (!once) setInView(false);
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

export function useHash() {
  const get = () => (typeof location !== 'undefined' ? location.hash.replace('#', '') : '');
  const [hash, setHash] = useState(get);
  useEffect(() => {
    const fn = () => setHash(get());
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  return hash;
}

/** Tracks which section id is currently most in view. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null; let bestR = 0;
      seen.forEach((r, id) => { if (r > bestR) { best = id; bestR = r; } });
      if (best) setActive(best);
    }, { threshold: [0, 0.1, 0.25, 0.5], rootMargin: '-30% 0px -50% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids.join(',')]);
  return active;
}
