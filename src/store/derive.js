import { PLANS, VOLUME_TARGETS, MUSCLE_MAP, LIFT_MAP, MILESTONE_STEP, SCALE_CATEGORY, BASELINE_MAXES } from './seed.js';
import { mondayOf, addDays, estimate1RM, roundTo } from '../lib/format.js';

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

// Builds the current session's exercises: PLANS' seed weights, scaled either
// by a per-exercise progression ratio carried over from previous sessions
// (state.exerciseWeights), or on first use, by the person's own starting
// numbers from onboarding (state.scaleFactors). Every set also carries
// seedName — the plan's canonical exercise identity — so a mid-session Swap
// (which only changes the displayed name) doesn't break progression tracking.
export function buildSessionEx(planKey, state) {
  return PLANS[planKey].ex.map(e => {
    const cat = SCALE_CATEGORY[MUSCLE_MAP[e.name]];
    const ratio = e.sets[0][0] > 0 ? (state.exerciseWeights[e.name] ?? (cat ? state.scaleFactors[cat] : 1) ?? 1) : 1;
    return {
      name: e.name, seedName: e.name, range: e.range, target: e.target,
      sets: e.sets.map(([w, r]) => ({ w: w > 0 ? roundTo(w * ratio, 5) : 0, r, done: false, logged: null }))
    };
  });
}

// After a session, carries each trained exercise's ending weight forward as
// next time's starting ratio — real progressive overload across sessions,
// instead of every workout resetting to the same seed numbers.
export function nextExerciseWeights(prevWeights, planKey, ex) {
  const out = { ...prevWeights };
  for (const e of ex) {
    const done = e.sets.filter(s => s.done);
    if (!done.length) continue;
    const seedDef = PLANS[planKey].ex.find(x => x.name === e.seedName);
    const seedFirst = seedDef ? seedDef.sets[0][0] : 0;
    if (seedFirst <= 0) continue;
    out[e.seedName] = Math.round((done[done.length - 1].w / seedFirst) * 100) / 100;
  }
  return out;
}

export function sessionFromCompletedEx(planKey, ex, date, id) {
  const sets = ex.flatMap(e => e.sets.filter(s => s.done).map(s => ({ exercise: e.name, muscle: MUSCLE_MAP[e.name] || null, weight: s.w, reps: s.logged, target: e.range })));
  const volume = sets.reduce((a, s) => a + s.weight * s.reps, 0);
  const p = PLANS[planKey];
  return { id, date, planKey, title: p ? p.title : ex[0]?.name || 'Workout', durationSec: null, sets, volume };
}

// Given a just-completed session's exercises, returns { Bench: 255, Squat: 320 }
// for any tracked lift whose top set produced a new estimated 1RM.
export function metricDeltasFromSession(ex) {
  const out = {};
  for (const e of ex) {
    const key = LIFT_MAP[e.seedName || e.name];
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
  const cap = 24;
  return VOLUME_TARGETS.map(v => {
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
