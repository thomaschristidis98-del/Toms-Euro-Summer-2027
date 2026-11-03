const d = (s) => new Date(s + 'T12:00:00Z');
const fmt = (s, o) => d(s).toLocaleDateString('en-GB', { timeZone: 'UTC', ...o });

export const dayMonth = (s) => fmt(s, { day: 'numeric', month: 'short' });
export const weekdayDayMonth = (s) => fmt(s, { weekday: 'short', day: 'numeric', month: 'short' });
export const dayNum = (s) => fmt(s, { day: 'numeric' });
export const monthShort = (s) => fmt(s, { month: 'short' });

export function dateRange(a, b) {
  if (!b) return `From ${fmt(a, { day: 'numeric', month: 'long' })}`;
  const sameMonth = d(a).getUTCMonth() === d(b).getUTCMonth();
  return sameMonth
    ? `${fmt(a, { day: 'numeric' })}–${fmt(b, { day: 'numeric', month: 'long' })}`
    : `${fmt(a, { day: 'numeric', month: 'long' })} – ${fmt(b, { day: 'numeric', month: 'long' })}`;
}

export const nightsLabel = (n) => (n == null ? 'Nights TBC' : `${n} night${n === 1 ? '' : 's'}`);
