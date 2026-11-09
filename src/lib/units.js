// Weight handling. Every weight in the store is in pounds; this module is
// the only place that converts, rounds, or steps one. Rounding always
// happens on the grid of the unit the person actually loads in — a kg lifter
// gets 82.5 kg, not "185 lb shown as 83.9" — which is why progression and
// the +/- steppers go through nudge()/snap() instead of adding a flat 5.
import { fmtNum } from './format.js';

export const LB_PER_KG = 2.2046226218;

export function toDisplay(lb, unit) {
  if (unit === 'kg') return Math.round((lb / LB_PER_KG) * 4) / 4;
  return Math.round(lb * 2) / 2;
}
export function fromDisplay(value, unit) {
  return unit === 'kg' ? value * LB_PER_KG : value;
}
export function fmtWeight(lb, unit) {
  return fmtNum(toDisplay(lb, unit), 2);
}
export function unitLabel(unit) {
  return unit === 'kg' ? 'kg' : 'lb';
}
export function withUnit(lb, unit) {
  return `${fmtWeight(lb, unit)} ${unitLabel(unit)}`;
}

// Smallest sensible jump for a piece of equipment at a given load, in the
// display unit. Light dumbbells and light stacks move in finer steps.
function gridStep(value, equipment, unit) {
  if (unit === 'kg') {
    if (equipment === 'dumbbell') return value < 10 ? 1 : 2.5;
    if (equipment === 'barbell') return 2.5;
    return value < 10 ? 1.25 : 2.5;
  }
  if (equipment === 'barbell') return 5;
  return value < 25 ? 2.5 : 5;
}

// Nearest loadable weight (returns pounds).
export function snap(lb, equipment, unit) {
  if (!(lb > 0)) return 0;
  const v = fromLb(lb, unit);
  const step = gridStep(v, equipment, unit);
  const snapped = Math.max(step, Math.round(v / step) * step);
  return fromDisplay(snapped, unit);
}

// Next loadable weight up (dir > 0) or down (dir < 0) from lb.
export function nudge(lb, dir, equipment, unit) {
  const v = fromLb(lb, unit);
  const eps = 1e-6;
  if (dir > 0) {
    const step = gridStep(v + eps, equipment, unit);
    return fromDisplay((Math.floor(v / step + eps) + 1) * step, unit);
  }
  const step = gridStep(v - eps, equipment, unit);
  return fromDisplay(Math.max(0, (Math.ceil(v / step - eps) - 1) * step), unit);
}

function fromLb(lb, unit) {
  return unit === 'kg' ? lb / LB_PER_KG : lb;
}

// Epley estimated one-rep max. A single is taken at face value, and reps
// past 20 stop adding — the formula is not meaningful that far out.
export function e1rm(weight, reps) {
  if (!(weight > 0) || !(reps > 0)) return 0;
  const r = Math.min(reps, 20);
  return r <= 1 ? weight : weight * (1 + r / 30);
}
// Inverse: the load that should allow `reps` with `rir` reps left in reserve.
export function weightFor(oneRepMax, reps, rir = 0) {
  return oneRepMax / (1 + (reps + rir) / 30);
}

const PLATES = { lb: [45, 35, 25, 10, 5, 2.5], kg: [25, 20, 15, 10, 5, 2.5, 1.25] };
const BAR = { lb: 45, kg: 20 };

// Plates per side for a barbell load. Returns null below an empty bar.
export function plateBreakdown(lb, unit) {
  const u = unit === 'kg' ? 'kg' : 'lb';
  const total = toDisplay(lb, u);
  const bar = BAR[u];
  if (total < bar) return null;
  let side = (total - bar) / 2;
  const perSide = [];
  for (const p of PLATES[u]) {
    while (side >= p - 1e-6) { perSide.push(p); side -= p; }
  }
  return { bar, perSide, leftover: Math.round(side * 2 * 100) / 100 };
}
export function fmtPlates(lb, unit) {
  const b = plateBreakdown(lb, unit);
  if (!b) return null;
  if (!b.perSide.length) return 'Empty bar';
  return `${b.perSide.map(p => fmtNum(p, 2)).join(' · ')} per side`;
}
