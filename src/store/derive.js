import { PLANS, VOLUME_SEED, MUSCLE_MAP, LIFT_MAP, MILESTONE_STEP, WEEKS_PATTERN, PLAN_ROTATION, STREAK_BASE } from './seed.js';
import { mondayOf, addDays, weekdayName, estimate1RM } from '../lib/format.js';

// Builds a plausible last-5-weeks workout log on first run, matching the
// prototype's WEEKS_PATTERN, so Numbers isn't empty before any real session
// has been logged. Every session added after this is real.
export function buildSeedWorkoutLog(todayIso) {
  const thisMonday = mondayOf(todayIso);
  const todayDow = (new Date(todayIso + 'T00:00:00').getDay() + 6) % 7;
  const log = [];
  let rot = 0;
  for (const wk of WEEKS_PATTERN) {
    const weekMonday = addDays(thisMonday, -7 * wk.offset);
    wk.days.forEach((level, dow) => {
      if (wk.offset === 0 && dow > todayDow) return; // no future workouts
      if (level === 0) return;
      const date = addDays(weekMonday, dow);
      const planKey = level === 1 ? 'sore' : PLAN_ROTATION[rot++ % PLAN_ROTATION.length];
      log.push(sessionFromPlan(planKey, date, `seed-${date}-${dow}`));
    });
  }
  return log;
}

function sessionFromPlan(planKey, date, id) {
  const p = PLANS[planKey];
  const sets = p.ex.flatMap(e => e.sets.map(([w, r]) => ({ exercise: e.name, muscle: MUSCLE_MAP[e.name] || null, weight: w, reps: r, target: e.range })));
  const volume = sets.reduce((a, s) => a + s.weight * s.reps, 0);
  return { id, date, planKey, title: p.title, durationSec: p.time * 60, sets, volume };
}

export function sessionFromCompletedEx(planKey, ex, date, id) {
  const sets = ex.flatMap(e => e.sets.filter(s => s.done).map(s => ({ exercise: e.name, muscle: MUSCLE_MAP[e.name] || null, weight: s.w, reps: s.logged, target: e.range })));
  const volume = sets.reduce((a, s) => a + s.weight * s.reps, 0);
  const p = PLANS[planKey];
  return { id, date, planKey, title: p ? p.title : ex[0]?.name || 'Workout', durationSec: null, sets, volume };
}

// Given a just-completed session's exercises, returns { Bench: 255, Squat: 320 }
// for any tracked lift whose top set beat (or newly established) an e1RM.
export function metricDeltasFromSession(ex) {
  const out = {};
  for (const e of ex) {
    const key = LIFT_MAP[e.name];
    if (!key) continue;
    const top = e.sets.filter(s => s.done).reduce((m, s) => Math.max(m, estimate1RM(s.w, s.logged)), 0);
    if (top > 0) out[key] = Math.max(out[key] || 0, top);
  }
  return out;
}

export function deriveMetrics(metricPoints, metricsSeedMeta) {
  const out = {};
  for (const key of Object.keys(metricPoints)) {
    const pts = metricPoints[key];
    const value = pts[pts.length - 1];
    const prev = pts.length > 1 ? pts[pts.length - 2] : value;
    const diff = Math.round((value - prev) * 10) / 10;
    const step = MILESTONE_STEP[key] || 5;
    const next = Math.ceil((value + 1) / step) * step;
    const meta = metricsSeedMeta[key];
    out[key] = {
      label: meta.label, value, unit: meta.unit, note: meta.note,
      delta: (diff >= 0 ? '+' : '') + diff + (key === 'score' ? ' pts' : meta.unit),
      up: diff >= 0,
      pts: pts.slice(-12),
      next: `${key === 'score' ? 'Score' : key} ${next}${meta.unit}`,
      nextGap: (next - value) + meta.unit + ' away',
      nextPct: Math.round((value / next) * 100)
    };
  }
  return out;
}

export function deriveVolume(workoutLog, todayIso) {
  const weekStart = mondayOf(todayIso);
  const weekEnd = addDays(weekStart, 6);
  const doneByMuscle = {};
  for (const s of workoutLog) {
    if (s.date < weekStart || s.date > weekEnd) continue;
    for (const set of s.sets) {
      if (!set.muscle) continue;
      doneByMuscle[set.muscle] = (doneByMuscle[set.muscle] || 0) + 1;
    }
  }
  const cap = 24;
  return VOLUME_SEED.map(v => {
    const done = doneByMuscle[v.muscle] || 0;
    const over = done > v.mrv, under = done < v.mev;
    return { muscle: v.muscle, done, mev: v.mev, mrv: v.mrv, pct: Math.round((done / cap) * 100), over, under };
  });
}

export function deriveWeeks(workoutLog, todayIso, weekCount = 5) {
  const thisMonday = mondayOf(todayIso);
  const weeks = [];
  for (let w = 0; w < weekCount; w++) {
    const monday = addDays(thisMonday, -7 * w);
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(monday, d);
      const sessions = workoutLog.filter(s => s.date === date);
      const level = sessions.some(s => s.planKey !== 'sore') ? 2 : (sessions.length ? 1 : 0);
      days.push({ date, level });
    }
    weeks.push({ label: w === 0 ? 'Now' : '-' + w, days });
  }
  return weeks;
}

// Current (in-progress) week only needs 2 sessions so far to count as clean —
// it isn't penalized for remaining days not having happened yet.
export function deriveStreak(weeks) {
  let streak = 0;
  for (const wk of weeks) {
    const trainingDays = wk.days.filter(d => d.level > 0).length;
    if (trainingDays >= 2) streak++; else break;
  }
  if (streak === weeks.length) streak += STREAK_BASE;
  return streak;
}

export function todayWeekdayLabel(todayIso) {
  return weekdayName(todayIso);
}
