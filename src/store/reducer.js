import { PLANS } from './seed.js';
import { metricDeltasFromSession, sessionFromCompletedEx } from './derive.js';
import { addDays, uid } from '../lib/format.js';

function buildEx(planKey) {
  return PLANS[planKey].ex.map(e => ({ ...e, sets: e.sets.map(([w, r]) => ({ w, r, done: false, logged: null })) }));
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.tab, unread: action.tab === 'coach' ? 0 : state.unread };

    case 'LOAD_PLAN':
      return { ...state, plan: action.plan, pivot: action.pivot, exIdx: 0, ex: null, session: null };

    case 'START_SESSION': {
      const ex = buildEx(state.plan);
      return { ...state, session: 'active', ex, exIdx: 0, seconds: 0, rest: 0, adjustNote: '', reps: ex[0].sets[0].r };
    }
    case 'RESUME_SESSION':
      return { ...state, session: 'active' };
    case 'PAUSE_SESSION':
      return { ...state, session: 'paused', tab: 'home' };
    case 'DISCARD_SESSION':
      return { ...state, session: null, ex: null, exIdx: 0, adjustNote: '', rest: 0 };

    case 'TICK': {
      if (state.session !== 'active') return state;
      return { ...state, seconds: state.seconds + 1, rest: state.rest > 0 ? state.rest - 1 : 0 };
    }

    case 'SHIFT_REPS':
      return { ...state, reps: Math.max(0, (state.reps || 0) + action.delta) };

    case 'LOG_SET': {
      const i = state.exIdx, ex = state.ex[i];
      const si = ex.sets.findIndex(s => !s.done);
      if (si < 0) return state;
      const s = ex.sets[si], reps = state.reps;
      const step = s.w >= 200 ? 10 : 5;
      let delta = 0, note = '';
      if (reps >= s.r + 2) { delta = step; note = `Two past target. Remaining sets go up ${step} lb.`; }
      else if (reps >= s.r + 1) { note = 'One past target. Holding the weight so the last sets stay in range.'; }
      else if (reps <= s.r - 3) { delta = -Math.round((s.w * 0.1) / 5) * 5; note = `Well short. Down ${Math.abs(delta)} lb so the remaining sets still land in range.`; }
      else if (reps <= s.r - 2) { delta = -step; note = `Two short. Down ${step} lb to keep the rest of the sets honest.`; }
      else { note = 'On target. Weight stays.'; }
      const sets = ex.sets.map((x, j) => j === si ? { ...x, done: true, logged: reps }
        : (j > si && delta ? { ...x, w: Math.max(0, x.w + delta) } : x));
      const nextSet = sets.find(x => !x.done);
      return {
        ...state,
        ex: state.ex.map((e, k) => k !== i ? e : { ...e, sets }),
        adjustNote: note,
        reps: nextSet ? nextSet.r : null,
        rest: nextSet ? state.restSeconds : 0,
        restTotal: state.restSeconds
      };
    }

    case 'ADD_REST':
      return { ...state, rest: state.rest + action.seconds, restTotal: state.restTotal + action.seconds };
    case 'SKIP_REST':
      return { ...state, rest: 0 };

    case 'ADVANCE_EXERCISE': {
      if (state.exIdx < state.ex.length - 1) {
        const n = state.exIdx + 1;
        return { ...state, exIdx: n, adjustNote: '', rest: 0, reps: state.ex[n].sets[0].r };
      }
      // last exercise done — finalize the session
      const totalSets = state.ex.reduce((a, e) => a + e.sets.length, 0);
      const doneSets = state.ex.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
      const volumeLifted = state.ex.reduce((a, e) => a + e.sets.filter(s => s.done).reduce((b, s) => b + s.w * s.logged, 0), 0);
      const minutes = Math.round(state.seconds / 60);

      const todayIso = action.todayIso;
      const entry = sessionFromCompletedEx(state.plan, state.ex, todayIso, uid());
      entry.durationSec = state.seconds;

      const deltas = metricDeltasFromSession(state.ex);
      let metricPoints = state.metricPoints;
      if (Object.keys(deltas).length) {
        metricPoints = { ...metricPoints };
        for (const k of Object.keys(deltas)) metricPoints[k] = [...metricPoints[k], deltas[k]];
        const bench = metricPoints.Bench[metricPoints.Bench.length - 1];
        const squat = metricPoints.Squat[metricPoints.Squat.length - 1];
        const dead = metricPoints.Deadlift[metricPoints.Deadlift.length - 1];
        metricPoints.score = [...metricPoints.score, Math.round((bench + squat + dead) * 1.05)];
      }

      return {
        ...state,
        session: null, rest: 0, summaryOpen: true,
        lastSummary: { doneSets, totalSets, minutes, volumeLifted },
        workoutLog: [...state.workoutLog, entry],
        metricPoints
      };
    }

    case 'CLOSE_SUMMARY':
      return { ...state, summaryOpen: false, tab: 'lab', ex: null, exIdx: 0, lastSummary: null };

    case 'OPEN_SWAP':
      return { ...state, swapOpen: true };
    case 'CLOSE_SWAP':
      return { ...state, swapOpen: false };
    case 'APPLY_SWAP':
      return { ...state, swapOpen: false, ex: state.ex.map((e, k) => k !== state.exIdx ? e : { ...e, name: action.name }) };

    case 'SET_METRIC':
      return { ...state, metric: action.metric };

    case 'TOGGLE_MEMORY':
      return { ...state, memoryOpen: !state.memoryOpen };
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };

    case 'SET_API_KEY':
      return { ...state, apiKey: action.apiKey };
    case 'SET_WEIGHT_UNIT':
      return { ...state, weightUnit: action.unit };
    case 'SET_REST_SECONDS':
      return { ...state, restSeconds: action.seconds };

    case 'APPEND_MESSAGE':
      return { ...state, chatThread: [...state.chatThread, action.message] };
    case 'UPDATE_MESSAGE':
      return { ...state, chatThread: state.chatThread.map(m => m.id === action.id ? { ...m, ...action.patch } : m) };
    case 'SET_TYPING':
      return { ...state, typing: action.typing };

    case 'ADD_MEMORY': {
      const { text, category, expiresInDays, todayIso } = action;
      const expiresAt = category === 'temporary' && expiresInDays ? addDays(todayIso, expiresInDays) : null;
      const tag = category === 'temporary' ? `Expires in ${expiresInDays} day${expiresInDays === 1 ? '' : 's'}` : 'Long term';
      return { ...state, memories: [...state.memories, { id: uid(), text, category, tag, expiresAt }] };
    }
    case 'EXPIRE_MEMORIES': {
      const kept = state.memories.filter(m => !m.expiresAt || m.expiresAt >= action.todayIso);
      return kept.length === state.memories.length ? state : { ...state, memories: kept };
    }

    case 'CONSUME_ACTION': {
      const msg = state.chatThread.find(m => m.id === action.id);
      if (!msg || !msg.action || msg.actionConsumed) return state;
      return {
        ...state,
        plan: msg.action.plan, pivot: msg.action.plan, tab: 'home',
        session: null, ex: null, exIdx: 0, adjustNote: '', rest: 0,
        chatThread: state.chatThread.map(m => m.id === action.id ? { ...m, actionConsumed: true } : m)
      };
    }

    default:
      return state;
  }
}
