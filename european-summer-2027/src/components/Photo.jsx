import React, { useEffect, useRef, useState } from 'react';
import { photos } from '../data/photos.js';
import { photoSources } from '../lib/commons.js';

/**
 * Renders a registry photo with a loading shimmer, a Commons fallback URL, and a
 * clearly labelled placeholder if the image cannot be loaded. Never substitutes
 * another photo.
 */
export function Photo({ id, size = 'card', sizes, className = '', imgClassName = '', eager = false, alt, position }) {
  const meta = photos[id];
  const src = photoSources(id, size);
  const [state, setState] = useState('loading'); // loading | loaded | fallback | error
  const [current, setCurrent] = useState(src);
  const imgRef = useRef(null);

  useEffect(() => { setState('loading'); setCurrent(photoSources(id, size)); }, [id, size]);

  // Catch images that finished loading before React attached its onLoad handler.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && state !== 'error') {
      if (img.naturalWidth > 0) setState('loaded');
    }
  }, [current]);

  if (!meta || !src) return <PhotoPlaceholder className={className} label="Photo to come" />;

  const onError = () => {
    if (state !== 'fallback' && current?.fallback) {
      setState('fallback');
      setCurrent({ src: current.fallback, srcSet: undefined });
    } else setState('error');
  };

  return (
    <div className={`photo ${state === 'loaded' ? 'is-loaded' : ''} ${className}`} data-state={state}>
      {state === 'error' ? (
        <PhotoPlaceholder label={meta.caption} note="Photo unavailable offline" />
      ) : (
        <img
          ref={imgRef}
          src={current.src}
          srcSet={current.srcSet}
          sizes={sizes || (size === 'hero' ? '100vw' : '(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw')}
          alt={alt || meta.alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchpriority={eager ? 'high' : undefined}
          decoding="async"
          referrerPolicy="no-referrer-when-downgrade"
          style={position ? { objectPosition: position } : undefined}
          className={imgClassName}
          onLoad={() => setState('loaded')}
          onError={onError}
        />
      )}
    </div>
  );
}

export function PhotoPlaceholder({ label, note, className = '', children }) {
  return (
    <div className={`photo-placeholder ${className}`} role="img" aria-label={label ? `${label} (photo placeholder)` : 'Photo placeholder'}>
      <svg viewBox="0 0 120 80" aria-hidden="true" className="photo-placeholder__art">
        <path d="M0 62 Q22 44 40 54 T78 46 T120 50 V80 H0Z" fill="currentColor" opacity=".18" />
        <path d="M0 70 Q30 58 58 66 T120 62 V80 H0Z" fill="currentColor" opacity=".28" />
        <circle cx="88" cy="22" r="9" fill="currentColor" opacity=".25" />
      </svg>
      <div className="photo-placeholder__text">
        {label && <span className="photo-placeholder__label">{label}</span>}
        {note && <span className="photo-placeholder__note">{note}</span>}
        {children}
      </div>
    </div>
  );
}
