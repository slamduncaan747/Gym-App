export const DAY_MS = 86400000;

export function todayISO(d = new Date()) {
  return toISO(d);
}
export function toISO(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const y = dt.getFullYear(), m = String(dt.getMonth() + 1).padStart(2, '0'), day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function addDays(iso, n) {
  const dt = new Date(iso + 'T00:00:00');
  dt.setDate(dt.getDate() + n);
  return toISO(dt);
}
export function mondayOf(iso) {
  const dt = new Date(iso + 'T00:00:00');
  const dow = (dt.getDay() + 6) % 7; // 0 = Monday
  dt.setDate(dt.getDate() - dow);
  return toISO(dt);
}
export function weekdayName(iso, short = false) {
  const dt = new Date(iso + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' });
}
export function dayLabel(iso, todayIso) {
  if (iso === todayIso) return 'Today';
  if (iso === addDays(todayIso, -1)) return 'Yesterday';
  return weekdayName(iso);
}

// Epley formula, rounded to nearest 2.5 lb (or kg-equivalent step upstream).
export function estimate1RM(weight, reps) {
  if (!weight || !reps) return 0;
  return Math.round((weight * (1 + reps / 30)) / 2.5) * 2.5;
}

export function toDisplayWeight(lb, unit) {
  return unit === 'kg' ? Math.round((lb * 0.4536) / 2.5) * 2.5 : lb;
}

export function fmtElapsed(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function weekOfProgram(startIso, todayIso, blockWeeks = 6) {
  const start = new Date(startIso + 'T00:00:00'), today = new Date(todayIso + 'T00:00:00');
  const weeksElapsed = Math.floor((today - start) / (7 * DAY_MS));
  return { week: (Math.max(0, weeksElapsed) % blockWeeks) + 1, of: blockWeeks };
}

export function roundTo(n, step = 5) {
  return Math.round(n / step) * step;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
