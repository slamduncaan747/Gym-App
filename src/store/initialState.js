import { THREAD_SEED, MEMORIES_SEED, METRICS_SEED } from './seed.js';
import { buildSeedWorkoutLog } from './derive.js';
import { addDays, uid } from '../lib/format.js';

export function freshState(todayIso) {
  return {
    tab: 'home',
    plan: 'base',
    pivot: null,
    session: null, // null | 'active' | 'paused'
    ex: null,
    exIdx: 0,
    reps: null,
    adjustNote: '',
    seconds: 0,
    rest: 0,
    restTotal: 150,
    swapOpen: false,
    summaryOpen: false,
    lastSummary: null,
    metric: 'score',
    memoryOpen: false,
    settingsOpen: false,
    unread: 2,
    typing: false,
    chatThread: THREAD_SEED.map(m => ({
      id: uid(), ts: addDays(todayIso, -m.daysAgo), me: m.me, text: m.text,
      saved: m.saved || null, action: m.action || null, actionConsumed: false
    })),
    memories: MEMORIES_SEED.map(m => ({ ...m })),
    workoutLog: buildSeedWorkoutLog(todayIso),
    metricPoints: Object.fromEntries(Object.entries(METRICS_SEED).map(([k, v]) => [k, [...v.pts]])),
    programStartDate: addDays(todayIso, -14),
    weightUnit: 'lb',
    restSeconds: 150,
    apiKey: ''
  };
}
