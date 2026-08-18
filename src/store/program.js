// The program generator: turns training-day count, split rotation, and
// this week's already-logged volume into an actual session — replacing the
// old fixed 6-plan lookup. This is what makes the "AI Rebalancer" concept
// from the product brief real instead of six pre-written objects.
import { EXERCISES, EXERCISES_BY_NAME, VOLUME_TARGETS, SPLIT_TEMPLATES, EASY_CARDIO } from './exercises.js';
import { deriveVolume } from './derive.js';
import { roundTo, todayISO } from '../lib/format.js';

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

function pickExercise(muscle, tier, noBar, used, seed) {
  let pool = EXERCISES.filter(e => e.muscle === muscle && e.tier === tier && !used.has(e.name) && (!noBar || e.equipment !== 'barbell'));
  if (!pool.length) pool = EXERCISES.filter(e => e.muscle === muscle && !used.has(e.name) && (!noBar || e.equipment !== 'barbell'));
  if (!pool.length) return null;
  return pool[seed % pool.length];
}

// Only the day's primary muscle chases its weekly MEV gap here — secondary
// muscles get a flat, conventional accessory dose. Without that split, a
// muscle that's merely "secondary" today but far under its weekly minimum
// would swallow a single isolation exercise into 5+ sets, producing a
// lopsided session instead of a normal one.
function setsForMuscle(role, done, landmark, short) {
  const base = role === 'primary' ? (short ? 3 : 4) : (short ? 2 : 3);
  if (!landmark) return base;
  const roomToMRV = landmark.mrv - done;
  if (roomToMRV <= 0) return 0;
  if (role !== 'primary') return Math.min(base, roomToMRV);
  const remainingToMEV = Math.max(0, landmark.mev - done);
  const wanted = Math.max(base, Math.min(remainingToMEV, base + 2));
  return Math.max(2, Math.min(wanted, roomToMRV, 8));
}

function finalize(title, entries, note, pivot) {
  const ex = entries.map(e => ({ ...e, sets: e.sets.map(s => ({ w: s.w, r: s.r, done: false, logged: null })) }));
  const estSets = ex.reduce((a, e) => a + e.sets.length, 0);
  const estMinutes = roundTo(estSets * 3.4, 5);
  const lifts = ex.map(e => ({ name: e.name, scheme: e.tier === 'conditioning' ? e.range : `${e.sets.length} × ${e.range}` }));
  return { title, ex, lifts, estSets, estMinutes, note, pivot: pivot || null };
}

function noteFor(pivot, autoAdjusted, short, noBar) {
  if (pivot === 'chest' || pivot === 'back' || pivot === 'legs') return `Shifted focus to ${pivot} by request.`;
  if (short) return 'Trimmed to the essentials — the big lift stays, accessories drop.';
  if (noBar) return 'Dumbbell, cable, and machine work only — same muscles, no barbell needed.';
  if (autoAdjusted) return `${autoAdjusted} is close to this week's max, so today's sets are lighter than usual.`;
  return '';
}

function recoverySession(state, seed) {
  const volume = volumeMap(state);
  const targets = VOLUME_TARGETS.map(v => ({ ...v, done: volume[v.muscle] || 0 }))
    .sort((a, b) => a.done - b.done).slice(0, 2);
  const used = new Set();
  const entries = [EASY_CARDIO];
  targets.forEach((t, i) => {
    const ex = pickExercise(t.muscle, 'isolation', false, used, seed + i) || pickExercise(t.muscle, 'accessory', false, used, seed + i);
    if (ex) { entries.push(buildExerciseEntry(ex, 3, state, 0.7)); used.add(ex.name); }
  });
  return finalize('Recovery', entries, 'Light work only — nothing near failure.', 'sore');
}

export function generateSession(state, pivot) {
  const seed = state.workoutLog.length;
  if (pivot === 'sore') return recoverySession(state, seed);

  const dayCount = clamp(state.profile.trainingDays.length || 3, 1, 6);
  const template = SPLIT_TEMPLATES[dayCount];
  let day = template[seed % template.length];

  if (pivot === 'chest' || pivot === 'back' || pivot === 'legs') {
    const map = {
      chest: { title: 'Chest focus', targets: [{ m: 'Chest', r: 'primary' }, { m: 'Triceps', r: 'secondary' }, { m: 'Shoulders', r: 'secondary' }] },
      back: { title: 'Back focus', targets: [{ m: 'Back', r: 'primary' }, { m: 'Biceps', r: 'secondary' }] },
      legs: { title: 'Legs focus', targets: [{ m: 'Quads', r: 'primary' }, { m: 'Hamstrings', r: 'primary' }, { m: 'Glutes', r: 'secondary' }] }
    };
    day = map[pivot];
  }

  const short = pivot === 'short';
  const noBar = pivot === 'nobar';
  const volume = volumeMap(state);
  const targets = short ? day.targets.filter(t => t.r === 'primary') : day.targets;

  const used = new Set();
  const entries = [];
  let autoAdjusted = null;

  targets.forEach((t, i) => {
    const landmark = VOLUME_TARGETS.find(v => v.muscle === t.m);
    const done = volume[t.m] || 0;
    const base = t.r === 'primary' ? (short ? 3 : 4) : (short ? 2 : 3);
    const sets = setsForMuscle(t.r, done, landmark, short);
    if (sets <= 0) return;
    if (sets < base) autoAdjusted = t.m;

    const compoundCount = t.r === 'primary' ? Math.min(sets, Math.ceil(sets * 0.55)) : 0;
    const accessoryCount = sets - compoundCount;

    if (compoundCount > 0) {
      const ex = pickExercise(t.m, 'compound', noBar, used, seed + i);
      if (ex) { entries.push(buildExerciseEntry(ex, compoundCount, state)); used.add(ex.name); }
    }
    if (accessoryCount > 0) {
      const tier = t.r === 'primary' ? 'accessory' : 'isolation';
      const ex = pickExercise(t.m, tier, noBar, used, seed + i + 7);
      if (ex) { entries.push(buildExerciseEntry(ex, accessoryCount, state)); used.add(ex.name); }
    }
  });

  const title = (pivot === 'chest' || pivot === 'back' || pivot === 'legs') ? day.title : (short ? day.title + ', condensed' : day.title);
  return finalize(title, entries, noteFor(pivot, autoAdjusted, short, noBar), pivot);
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
