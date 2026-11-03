// npm run check — validates the itinerary data. Exits non-zero on any error.
import { trip, destinations, journeys, greece } from '../src/data/trip.js';
import { photos } from '../src/data/photos.js';

const errors = [];
const warn = [];
const day = (s) => new Date(s + 'T12:00:00Z');
const nightsBetween = (a, b) => Math.round((day(b) - day(a)) / 86400000);
const wd = (s) => day(s).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

let total = 0;
destinations.forEach((d, i) => {
  if (d.checkOut) {
    const n = nightsBetween(d.checkIn, d.checkOut);
    if (n !== d.nights) errors.push(`${d.name}: ${d.checkIn}→${d.checkOut} is ${n} nights, data says ${d.nights}`);
    total += n;
  }
  const prev = destinations[i - 1];
  if (prev && prev.checkOut && prev.checkOut !== d.checkIn) errors.push(`${prev.name} check-out ${prev.checkOut} ≠ ${d.name} check-in ${d.checkIn}`);
  if (d.hero && !photos[d.hero]) errors.push(`${d.name}: missing hero photo ${d.hero}`);
  d.attractions.forEach((a) => { if (!photos[a.photo]) errors.push(`${d.name}/${a.name}: missing photo ${a.photo}`); });
  d.next.forEach((j) => { if (!journeys[j]) errors.push(`${d.name}: unknown journey ${j}`); });
  console.log(`${d.name.padEnd(8)} ${wd(d.checkIn)} → ${d.checkOut ? wd(d.checkOut) : 'TBC'}  ${d.nights ?? '—'} nights`);
});

const corfu = destinations.at(-1);
const greeceNights = nightsBetween(corfu.checkIn, trip.end);
if (greeceNights !== greece.nights) errors.push(`Greece: ${corfu.checkIn}→${trip.end} is ${greeceNights} nights, data says ${greece.nights}`);
total += greeceNights;
console.log(`Greece   ${wd(corfu.checkIn)} → ${wd(trip.end)}  ${greeceNights} nights (TBC)`);
if (total !== trip.totalNights) errors.push(`Total nights ${total} ≠ ${trip.totalNights}`);
if (destinations[0].checkIn !== trip.start) errors.push('First check-in does not match trip start');

// Expected weekdays from the brief.
const expect = { '2027-07-24': 'Sat', '2027-07-26': 'Mon', '2027-07-29': 'Thu', '2027-07-31': 'Sat', '2027-08-02': 'Mon', '2027-08-04': 'Wed', '2027-08-06': 'Fri', '2027-08-07': 'Sat', '2027-08-11': 'Wed', '2027-08-14': 'Sat', '2027-08-27': 'Fri' };
for (const [d, w] of Object.entries(expect)) if (!wd(d).startsWith(w)) errors.push(`${d} is ${wd(d)}, expected ${w}`);

Object.entries(journeys).forEach(([id, j]) => {
  if (!j.sources?.length) warn.push(`${id}: no source`);
  if (j.mode === 'road' && !j.routeUrl) errors.push(`${id}: road journey without routeUrl`);
});
Object.entries(photos).forEach(([id, p]) => { if (!p.alt) errors.push(`photo ${id}: missing alt text`); });

console.log(`\nTotal: ${total} nights`);
warn.forEach((w) => console.warn('warn:', w));
if (errors.length) { errors.forEach((e) => console.error('ERROR:', e)); process.exit(1); }
console.log('All itinerary checks passed.');
