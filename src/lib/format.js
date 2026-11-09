// Dates are handled as local-calendar ISO strings ('YYYY-MM-DD') everywhere,
// so "today" always means the user's wall-clock day and string comparison
// sorts chronologically.
export const DAY_MS = 86400000;

export function toISO(d) {
  const dt = new Date(d);
  const y = dt.getFullYear(), m = String(dt.getMonth() + 1).padStart(2, '0'), day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function todayISO(d = new Date()) {
  return toISO(d);
}
function parse(iso) {
  return new Date(iso + 'T00:00:00');
}
export function addDays(iso, n) {
  const dt = parse(iso);
  dt.setDate(dt.getDate() + n);
  return toISO(dt);
}
export function mondayOf(iso) {
  const dt = parse(iso);
  const dow = (dt.getDay() + 6) % 7; // 0 = Monday
  dt.setDate(dt.getDate() - dow);
  return toISO(dt);
}
// Whole calendar days from a to b (positive when b is later). Rounded so a
// daylight-saving shift inside the span can't make it come up a day short.
export function daysBetween(a, b) {
  return Math.round((parse(b) - parse(a)) / DAY_MS);
}
export function weekdayName(iso, short = false) {
  return parse(iso).toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' });
}
// 'Mon'…'Sun', matching the keys stored in profile.trainingDays.
export function weekdayKey(iso) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parse(iso).getDay()];
}
export function dayLabel(iso, todayIso) {
  if (iso === todayIso) return 'Today';
  if (iso === addDays(todayIso, -1)) return 'Yesterday';
  if (iso === addDays(todayIso, 1)) return 'Tomorrow';
  const gap = daysBetween(todayIso, iso);
  if (gap > -7 && gap < 7) return weekdayName(iso);
  return fmtDate(iso, todayIso);
}
// 'Nov 9', or 'Nov 9, 2025' when it isn't this year.
export function fmtDate(iso, todayIso) {
  const sameYear = !todayIso || iso.slice(0, 4) === todayIso.slice(0, 4);
  return parse(iso).toLocaleDateString('en-US', sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
}
export function monthLabel(iso) {
  return parse(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function fmtElapsed(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
}
export function fmtDuration(sec) {
  const m = Math.round((sec || 0) / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

export function roundTo(n, step = 5) {
  return Math.round(n / step) * step;
}
export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}
// Trims float noise and trailing zeros: 82.50000001 -> '82.5', 185 -> '185'.
export function fmtNum(n, digits = 1) {
  if (!Number.isFinite(n)) return '0';
  const f = 10 ** digits;
  return String(Math.round(n * f) / f);
}
export function fmtCompact(n) {
  if (n >= 1e6) return fmtNum(n / 1e6, 2) + 'M';
  if (n >= 10000) return fmtNum(n / 1000, 0) + 'k';
  if (n >= 1000) return fmtNum(n / 1000, 1) + 'k';
  return fmtNum(n, 0);
}
export function plural(n, word, pluralWord) {
  return `${n} ${n === 1 ? word : (pluralWord || word + 's')}`;
}
export function joinList(items) {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
