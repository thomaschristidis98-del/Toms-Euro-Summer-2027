import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);

// Offline support (PWA). Service workers only run on a real web host such as Vercel.
if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.__ES27_INLINE__) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* not available in this context */ });
  });
}
