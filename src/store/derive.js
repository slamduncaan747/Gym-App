import { VOLUME_TARGETS, EXERCISES_BY_NAME } from './exercises.js';
import { MILESTONE_STEP, BASELINE_MAXES } from './seed.js';
import { mondayOf, addDays, estimate1RM } from '../lib/format.js';

export function scaleFactorsFromMaxes(maxes) {
  return {
    chest: maxes.Bench ? maxes.Bench / BASELINE_MAXES.Bench : 1,
    legs: maxes.Squat ? maxes.Squat / BASELINE_MAXES.Squat : 1,
    back: maxes.Deadlift ? maxes.Deadlift / BASELINE_MAXES.Deadlift : 1
  };
}

export function scoreFromMaxes(maxes) {
  return Math.round(((maxes.Bench || 0) + (maxes.Squat || 0) + (maxes.Deadlift || 0)) * 1.05);
}

// After a session, carries each trained exercise's ending weight forward as
// next time's starting ratio — real progressive overload across sessions,
// instead of every workout resetting to the same starting numbers.
export function nextExerciseWeights(prevWeights, ex) {
  const out = { ...prevWeights };
  for (const e of ex) {
    const done = e.sets.filter(s => s.done);
    if (!done.length) continue;
    const seedDef = EXERCISES_BY_NAME[e.seedName];
    if (!seedDef || seedDef.baseWeight <= 0) continue;
    out[e.seedName] = Math.round((done[done.length - 1].w / seedDef.baseWeight) * 100) / 100;
  }
  return out;
}

export function sessionFromCompletedEx(title, pivot, ex, date, id) {
  const sets = ex.flatMap(e => e.sets.filter(s => s.done).map(s => ({ exercise: e.name, muscle: e.muscle || null, weight: s.w, reps: s.logged, target: e.range })));
  const volume = sets.reduce((a, s) => a + s.weight * s.reps, 0);
  return { id, date, title, pivot: pivot || null, durationSec: null, sets, volume };
}

// Given a just-completed session's exercises, returns { Bench: 255, Squat: 320 }
// for any tracked lift whose top set produced a new estimated 1RM.
export function metricDeltasFromSession(ex) {
  const out = {};
  for (const e of ex) {
    const key = EXERCISES_BY_NAME[e.seedName]?.tracksLift;
    if (!key) continue;
    const top = e.sets.filter(s => s.done).reduce((m, s) => Math.max(m, estimate1RM(s.w, s.logged)), 0);
    if (top > 0) out[key] = Math.max(out[key] || 0, top);
  }
  return out;
}

export function deriveMetrics(metricPoints, metricsMeta) {
  const out = {};
  for (const key of Object.keys(metricPoints)) {
    const pts = metricPoints[key];
    if (!pts.length) { out[key] = null; continue; }
    const value = pts[pts.length - 1];
    const prev = pts.length > 1 ? pts[pts.length - 2] : value;
    const diff = Math.round((value - prev) * 10) / 10;
    const step = MILESTONE_STEP[key] || 5;
    const next = Math.ceil((value + 1) / step) * step;
    const meta = metricsMeta[key];
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
  return VOLUME_TARGETS.map(v => {
    const done = doneByMuscle[v.muscle] || 0;
    const over = done > v.mrv, under = done < v.mev;
    const cap = v.mrv * 1.15;
    return { muscle: v.muscle, done, mev: v.mev, mrv: v.mrv, pct: Math.min(100, Math.round((done / cap) * 100)), over, under };
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
      const level = sessions.some(s => s.pivot !== 'sore') ? 2 : (sessions.length ? 1 : 0);
      days.push({ date, level });
    }
    weeks.push({ label: w === 0 ? 'Now' : '-' + w, days });
  }
  return weeks;
}

// A week only needs 2 training days to count clean; the current (still
// in-progress) week is judged the same way rather than penalized for days
// that simply haven't happened yet.
export function deriveStreak(weeks) {
  let streak = 0;
  for (const wk of weeks) {
    const trainingDays = wk.days.filter(d => d.level > 0).length;
    if (trainingDays >= 2) streak++; else break;
  }
  return streak;
}
