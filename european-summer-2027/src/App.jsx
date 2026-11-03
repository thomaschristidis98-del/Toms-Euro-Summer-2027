import React, { useEffect, useState } from 'react';
import { destinations } from './data/trip.js';
import { LightboxProvider } from './components/Lightbox.jsx';
import { Nav } from './components/Nav.jsx';
import { Hero, Timeline } from './components/Hero.jsx';
import { RouteSection, Highlights, Finale, Credits, Footer, OwnerPanel } from './components/Sections.jsx';
import { Destination } from './components/Destination.jsx';
import { useHash } from './lib/hooks.js';
import { loadCredits } from './lib/commons.js';

function useOwner() {
  const hash = useHash();
  const [owner, setOwner] = useState(() => { try { return sessionStorage.getItem('es27-owner') === '1'; } catch { return false; } });
  useEffect(() => {
    if (hash === 'owner') { setOwner(true); try { sessionStorage.setItem('es27-owner', '1'); } catch { /* ignore */ } }
    if (hash === 'guest') { setOwner(false); try { sessionStorage.removeItem('es27-owner'); } catch { /* ignore */ } }
  }, [hash]);
  return owner;
}

export default function App() {
  const owner = useOwner();
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 2500));
    idle(() => loadCredits());
  }, []);

  return (
    <LightboxProvider>
      <a href="#route" className="skip">Skip to the route</a>
      <Nav />
      <main>
        <Hero />
        <Timeline />
        <RouteSection />
        <Highlights />
        <div className="chapters">
          {destinations.map((d, i) => <Destination key={d.id} d={d} index={i} owner={owner} />)}
        </div>
        <Finale />
        {owner && <OwnerPanel />}
        <Credits />
      </main>
      <Footer />
    </LightboxProvider>
  );
}
