// The program generator: turns split style, training-day count, equipment
// access, and this week's already-logged volume into an actual session —
// replacing the old fixed 6-plan lookup. This is what makes the "AI
// Rebalancer" concept from the product brief real instead of six
// pre-written objects.
import { EXERCISES, EXERCISES_BY_NAME, VOLUME_TARGETS, STYLE_TEMPLATES, AUTO_STYLE_BY_DAYS, MUSCLE_FOCUS, EASY_CARDIO } from './exercises.js';
import { deriveVolume } from './derive.js';
import { roundTo, todayISO } from '../lib/format.js';

const MIN_PER_SET = 3.4;
const EQUIPMENT_BY_LEVEL = {
  full: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band'],
  dumbbell: ['dumbbell', 'cable', 'bodyweight', 'band'],
  bodyweight: ['bodyweight', 'band']
};

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function volumeMap(state) {
  const rows = deriveVolume(state.workoutLog, todayISO());
  return Object.fromEntries(rows.map(r => [r.muscle, r.done]));
}

function weightRatio(exercise, state) {
  if (state.exerciseWeights[exercise.name] != null) return state.exerciseWeights[exercise.name];
  return exercise.scaleFrom ? (state.scaleFactors[exercise.scaleFrom] ?? 1) : 1;
}

function pyramidSets(w, count, isCompound) {
  if (!isCompound || count < 3) return new Array(count).fill(w);
  const step = w >= 200 ? 10 : 5;
  const arr = new Array(count).fill(w);
  for (let i = 1; i < count - 1; i++) arr[i] = w + step;
  return arr;
}

function buildExerciseEntry(ex, count, state, lightFactor = 1) {
  const ratio = weightRatio(ex, state) * lightFactor;
  const w = ex.baseWeight > 0 ? roundTo(ex.baseWeight * ratio, 5) : 0;
  const weights = pyramidSets(w, count, ex.tier === 'compound');
  const [lo, hi] = ex.reps;
  return {
    name: ex.name, seedName: ex.name, muscle: ex.muscle, tier: ex.tier, equipment: ex.equipment,
    range: `${lo}–${hi}`, target: ex.muscle.toLowerCase(),
    sets: weights.map((ww, i) => ({ w: ww, r: i === 0 ? hi : Math.max(lo, hi - 1) }))
  };
}

function allowedEquipment(state, noBar) {
  const level = state.profile.equipment || 'full';
  let allowed = EQUIPMENT_BY_LEVEL[level] || EQUIPMENT_BY_LEVEL.full;
  if (noBar) allowed = allowed.filter(e => e !== 'barbell');
  return allowed;
}

function pickExercise(muscle, tier, allowed, used, seed) {
  let pool = EXERCISES.filter(e => e.muscle === muscle && e.tier === tier && !used.has(e.name) && allowed.includes(e.equipment));
  if (!pool.length) pool = EXERCISES.filter(e => e.muscle === muscle && !used.has(e.name) && allowed.includes(e.equipment));
  if (!pool.length) pool = EXERCISES.filter(e => e.muscle === muscle && !used.has(e.name));
  if (!pool.length) return null;
  return pool[seed % pool.length];
}

// Only the day's primary muscle chases its weekly MEV gap here — secondary
// muscles get a flat, conventional accessory dose. Without that split, a
// muscle that's merely "secondary" today but far under its weekly minimum
// would swallow a single isolation exercise into 5+ sets, producing a
// lopsided session instead of a normal one.
function setsForMuscle(role, done, landmark) {
  const base = role === 'primary' ? 4 : 3;
  if (!landmark) return { sets: base, capped: false };
  const roomToMRV = landmark.mrv - done;
  if (roomToMRV <= 0) return { sets: 0, capped: true };
  if (role !== 'primary') {
    const sets = Math.min(base, roomToMRV);
    return { sets, capped: sets < base };
  }
  const remainingToMEV = Math.max(0, landmark.mev - done);
  const wanted = Math.max(base, Math.min(remainingToMEV, base + 2));
  const sets = Math.max(2, Math.min(wanted, roomToMRV, 8));
  return { sets, capped: sets < Math.min(wanted, 8) };
}

// Trims or pads targets to land near a wanted total set count (used for
// both the adjustable-length picker and the old 30-minute shortcut).
// Secondary muscles get cut first, then primary work; extra time adds to
// primary muscles first, respecting their MRV room.
function fitToSetCount(targets, wantedSets) {
  const total = () => targets.reduce((a, t) => a + t.sets, 0);
  let guard = 0;
  while (total() > wantedSets && guard++ < 80) {
    const secondary = targets.filter(t => t.r === 'secondary' && t.sets > 0);
    const pool = secondary.length ? secondary : targets.filter(t => t.sets > 2);
    if (!pool.length) break;
    pool.reduce((a, b) => (a.sets >= b.sets ? a : b)).sets -= 1;
  }
  guard = 0;
  while (total() < wantedSets && guard++ < 80) {
    const room = targets.filter(t => t.r === 'primary' && (!t.landmark || t.sets < Math.min(t.landmark.mrv - t.done, 10)));
    if (!room.length) break;
    room.reduce((a, b) => (a.sets <= b.sets ? a : b)).sets += 1;
  }
  return targets.filter(t => t.sets > 0);
}

function finalize(title, entries, note, pivot) {
  const ex = entries.map(e => ({ ...e, sets: e.sets.map(s => ({ w: s.w, r: s.r, done: false, logged: null })) }));
  const estSets = ex.reduce((a, e) => a + e.sets.length, 0);
  const estMinutes = roundTo(estSets * MIN_PER_SET, 5);
  const lifts = ex.map(e => ({ name: e.name, scheme: e.tier === 'conditioning' ? e.range : `${e.sets.length} × ${e.range}` }));
  return { title, ex, lifts, estSets, estMinutes, note, pivot: pivot || null };
}

function titleFromTargets(targets, fallback) {
  const primaries = targets.filter(t => t.sets > 0 && t.r === 'primary').map(t => t.m);
  if (!primaries.length) return fallback;
  if (primaries.length >= 3) return 'Full body';
  return primaries.join(' & ');
}

function noteFor({ pivot, autoAdjusted, minutesNote }) {
  if (pivot === 'chest' || pivot === 'back' || pivot === 'legs') return `Shifted focus to ${pivot} by request.`;
  if (minutesNote) return minutesNote;
  if (pivot === 'nobar') return 'Dumbbell, cable, and machine work only — same muscles, no barbell needed.';
  if (autoAdjusted) return `${autoAdjusted} is close to this week's max, so today's sets are lighter than usual.`;
  return '';
}

function recoverySession(state, seed) {
  const volume = volumeMap(state);
  const allowed = allowedEquipment(state, false);
  const targets = VOLUME_TARGETS.map(v => ({ ...v, done: volume[v.muscle] || 0 }))
    .sort((a, b) => a.done - b.done).slice(0, 2);
  const used = new Set();
  const entries = [EASY_CARDIO];
  targets.forEach((t, i) => {
    const ex = pickExercise(t.muscle, 'isolation', allowed, used, seed + i) || pickExercise(t.muscle, 'accessory', allowed, used, seed + i);
    if (ex) { entries.push(buildExerciseEntry(ex, 3, state, 0.7)); used.add(ex.name); }
  });
  return finalize('Recovery', entries, 'Light work only — nothing near failure.', 'sore');
}

function templateFor(state) {
  const style = state.profile.splitStyle && state.profile.splitStyle !== 'auto' ? state.profile.splitStyle : null;
  if (style && STYLE_TEMPLATES[style]) return STYLE_TEMPLATES[style];
  const dayCount = clamp(state.profile.trainingDays.length || 3, 1, 6);
  return STYLE_TEMPLATES[AUTO_STYLE_BY_DAYS[dayCount]];
}

export function generateSession(state, pivot) {
  const seed = state.workoutLog.length;
  if (pivot === 'sore') return recoverySession(state, seed);

  let dayBlueprint;
  if (pivot === 'chest' || pivot === 'back' || pivot === 'legs') {
    dayBlueprint = { title: `${pivot[0].toUpperCase()}${pivot.slice(1)} focus`, targets: MUSCLE_FOCUS[pivot].targets };
  } else {
    const template = templateFor(state);
    dayBlueprint = template[seed % template.length];
  }

  const noBar = pivot === 'nobar';
  const allowed = allowedEquipment(state, noBar);
  const volume = volumeMap(state);

  let targets = dayBlueprint.targets.map(t => {
    const landmark = VOLUME_TARGETS.find(v => v.muscle === t.m);
    const done = volume[t.m] || 0;
    const { sets, capped } = setsForMuscle(t.r, done, landmark);
    return { m: t.m, r: t.r, landmark, done, sets, capped };
  }).filter(t => t.sets > 0);

  const autoAdjusted = targets.find(t => t.capped)?.m;

  let minutesNote = '';
  const wantedMinutes = pivot === 'short' ? 30 : state.targetMinutes;
  if (wantedMinutes) {
    const wantedSets = Math.max(4, Math.round(wantedMinutes / MIN_PER_SET));
    targets = fitToSetCount(targets, wantedSets);
    minutesNote = `Fit to about ${wantedMinutes} minutes.`;
  }

  const used = new Set();
  const entries = [];
  targets.forEach((t, i) => {
    const compoundCount = t.r === 'primary' ? Math.min(t.sets, Math.ceil(t.sets * 0.55)) : 0;
    const accessoryCount = t.sets - compoundCount;
    if (compoundCount > 0) {
      const ex = pickExercise(t.m, 'compound', allowed, used, seed + i);
      if (ex) { entries.push(buildExerciseEntry(ex, compoundCount, state)); used.add(ex.name); }
    }
    if (accessoryCount > 0) {
      const tier = t.r === 'primary' ? 'accessory' : 'isolation';
      const ex = pickExercise(t.m, tier, allowed, used, seed + i + 7);
      if (ex) { entries.push(buildExerciseEntry(ex, accessoryCount, state)); used.add(ex.name); }
    }
  });

  const title = (pivot === 'chest' || pivot === 'back' || pivot === 'legs')
    ? dayBlueprint.title
    : titleFromTargets(targets, dayBlueprint.title);

  return finalize(title, entries, noteFor({ pivot, autoAdjusted, minutesNote }), pivot);
}

// Used both to build the mid-session Swap sheet's options and to recompute
// a sensible weight/rep target when one is applied.
export function alternativesFor(name) {
  const ex = EXERCISES_BY_NAME[name];
  if (!ex) return [];
  let pool = EXERCISES.filter(e => e.name !== name && e.muscle === ex.muscle && e.equipment !== ex.equipment);
  if (pool.length < 3) pool = pool.concat(EXERCISES.filter(e => e.name !== name && e.muscle === ex.muscle && !pool.includes(e)));
  return pool.slice(0, 3).map(p => ({ name: p.name, note: p.equipment }));
}

export function rebuildForSwap(name, setCount, state) {
  const ex = EXERCISES_BY_NAME[name];
  if (!ex) return null;
  return buildExerciseEntry(ex, setCount, state);
}
