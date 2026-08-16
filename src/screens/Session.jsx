import { useStore } from '../store/StoreContext.jsx';
import { ALTS, ALT_FALLBACK } from '../store/seed.js';
import { ACC, ACC_SOFT, ACC_TEXT, RAISED } from '../store/theme.js';
import { fmtElapsed, toDisplayWeight, todayISO } from '../lib/format.js';
import { haptic } from '../lib/haptics.js';

export default function Session() {
  const { state, dispatch } = useStore();
  const cur = state.ex[state.exIdx];
  const si = cur.sets.findIndex(s => !s.done);
  const act = si < 0 ? null : cur.sets[si];
  const curDone = si < 0;
  const last = state.exIdx === state.ex.length - 1;
  const showEntry = !!act && state.rest <= 0;
  const restActive = state.rest > 0;
  const unit = state.weightUnit === 'kg' ? ' kg' : ' lb';
  const cv = w => toDisplayWeight(w, state.weightUnit);
  const mins = Math.floor(state.rest / 60), secs = state.rest % 60;

  const logSet = () => { haptic.success(); dispatch({ type: 'LOG_SET' }); };
  const shiftReps = (d) => { haptic.tap(); dispatch({ type: 'SHIFT_REPS', delta: d }); };
  const advance = () => { haptic.success(); dispatch({ type: 'ADVANCE_EXERCISE', todayIso: todayISO() }); };
  const skipRest = () => { haptic.tap(); dispatch({ type: 'SKIP_REST' }); };

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: '#0E0F12',
      display: 'flex', flexDirection: 'column', zIndex: 40,
      paddingTop: 'env(safe-area-inset-top, 0px)', animation: 'ovRise .26s ease'
    }}>
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="pressable" onClick={() => { haptic.tap(); dispatch({ type: 'PAUSE_SESSION' }); }} style={{
          width: 38, height: 38, borderRadius: 13, border: '1.5px solid rgba(255,255,255,.11)', background: 'transparent',
          color: 'rgba(238,241,244,.55)', fontFamily: 'Chivo,sans-serif', fontSize: 17, fontWeight: 700, cursor: 'pointer',
          lineHeight: 1, flex: 'none'
        }}>×</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
          {state.ex.map((e, j) => (
            <div key={j} style={{ flex: 1, height: 3, borderRadius: 9, background: j < state.exIdx ? ACC : (j === state.exIdx ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.08)'), transition: 'background .3s ease' }} />
          ))}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.04em', color: 'rgba(238,241,244,.34)', fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{fmtElapsed(state.seconds)}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '30px 24px 0' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Exercise {state.exIdx + 1} of {state.ex.length}</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginTop: 12 }}>
          <div style={{ flex: 1, fontSize: 30, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.06, textWrap: 'balance' }}>{cur.name}</div>
          <button className="pressable-subtle" onClick={() => { haptic.tap(); dispatch({ type: 'OPEN_SWAP' }); }} style={{
            flex: 'none', height: 36, padding: '0 14px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,.11)',
            background: 'transparent', color: 'rgba(238,241,244,.5)', fontFamily: 'Chivo,sans-serif', fontSize: 13.5,
            fontWeight: 700, cursor: 'pointer', marginTop: 4
          }}>Swap</button>
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cur.sets.map((s, j) => {
            const active = j === si;
            const main = (s.w > 0 ? cv(s.w) + unit + ' × ' : '') + (s.done ? s.logged : (active ? cur.range : s.r));
            const tag = s.done ? 'Logged' : (active ? 'Now' : '');
            return (
              <div key={j} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '17px 18px', borderRadius: 16,
                background: active ? ACC_SOFT : 'transparent', border: `1.5px solid ${active ? ACC : 'rgba(255,255,255,.07)'}`,
                transition: 'background .25s ease, border-color .25s ease'
              }}>
                <div style={{ width: 16, fontSize: 13, fontWeight: 700, color: active ? ACC_TEXT : 'rgba(238,241,244,.26)', flex: 'none' }}>{j + 1}</div>
                <div style={{ flex: 1, fontSize: 18.5, fontWeight: 800, letterSpacing: '-.03em', color: s.done ? 'rgba(238,241,244,.5)' : (active ? '#EEF1F4' : 'rgba(238,241,244,.34)') }}>{main}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? ACC_TEXT : 'rgba(238,241,244,.26)' }}>{tag}</div>
              </div>
            );
          })}
        </div>

        {state.adjustNote && (
          <div style={{ marginTop: 22, fontSize: 14, lineHeight: 1.6, color: 'rgba(238,241,244,.42)', maxWidth: '32ch', textWrap: 'pretty', animation: 'ovFade .3s ease' }}>{state.adjustNote}</div>
        )}
        <div style={{ height: 28 }} />
      </div>

      {showEntry && (
        <div style={{ flex: 'none', padding: '18px 24px calc(env(safe-area-inset-bottom, 0px) + 20px)', borderTop: '1px solid rgba(255,255,255,.06)', background: RAISED, animation: 'ovFade .2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Reps completed</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(238,241,244,.34)' }}>Target {cur.range}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <button className="pressable" onClick={() => shiftReps(-1)} style={stepperBtn}>−</button>
            <div key={state.reps} style={{ flex: 1, textAlign: 'center', fontSize: 44, fontWeight: 900, letterSpacing: '-.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', animation: 'ovPop .15s ease' }}>{state.reps ?? ''}</div>
            <button className="pressable" onClick={() => shiftReps(1)} style={stepperBtn}>+</button>
          </div>
          <button className="pressable" onClick={logSet} style={primaryBtn}>Log set {si + 1}</button>
        </div>
      )}

      {restActive && (
        <div style={{ flex: 'none', padding: '18px 24px calc(env(safe-area-inset-bottom, 0px) + 20px)', borderTop: '1px solid rgba(255,255,255,.06)', background: RAISED, animation: 'ovFade .22s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Rest</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(238,241,244,.34)' }}>{act ? `Set ${si + 1} next` : ''}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{mins}:{String(secs).padStart(2, '0')}</div>
            <div style={{ flex: 1, height: 4, borderRadius: 9, background: 'rgba(255,255,255,.09)', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: ACC, width: `${Math.round((state.rest / state.restTotal) * 100)}%`, transition: 'width 1s linear' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 18 }}>
            <button className="pressable-subtle" onClick={() => { haptic.tap(); dispatch({ type: 'ADD_REST', seconds: 15 }); }} style={{
              flex: 'none', width: 96, height: 54, borderRadius: 17, border: '1.5px solid rgba(255,255,255,.11)',
              background: 'transparent', color: 'rgba(238,241,244,.75)', fontFamily: 'Chivo,sans-serif', fontSize: 15.5,
              fontWeight: 700, cursor: 'pointer'
            }}>+15s</button>
            <button className="pressable" onClick={skipRest} style={{
              flex: 1, height: 54, borderRadius: 17, border: 'none', background: ACC, color: '#fff',
              fontFamily: 'Chivo,sans-serif', fontSize: 16, fontWeight: 800, cursor: 'pointer'
            }}>Skip rest</button>
          </div>
        </div>
      )}

      {curDone && (
        <div style={{ flex: 'none', padding: '18px 24px calc(env(safe-area-inset-bottom, 0px) + 20px)', borderTop: '1px solid rgba(255,255,255,.06)', background: RAISED }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>{cur.name} done</div>
          <button className="pressable" onClick={advance} style={{ ...primaryBtn, animation: 'ovRise .25s ease' }}>
            {last ? 'Finish session' : `Next: ${state.ex[state.exIdx + 1].name}`}
          </button>
        </div>
      )}

      {state.swapOpen && <SwapSheet cur={cur} dispatch={dispatch} />}
    </div>
  );
}

function SwapSheet({ cur, dispatch }) {
  const alts = ALTS[cur.name] || ALT_FALLBACK;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,7,9,.72)', display: 'flex', alignItems: 'flex-end', zIndex: 55, animation: 'ovFade .18s ease' }}>
      <div style={{ width: '100%', background: '#15171B', borderRadius: '28px 28px 0 0', padding: `28px 24px calc(env(safe-area-inset-bottom, 0px) + 24px)`, animation: 'ovRise .22s ease' }}>
        <div style={{ fontSize: 23, fontWeight: 900, letterSpacing: '-.03em' }}>Swap for</div>
        <div style={{ fontSize: 14, color: 'rgba(238,241,244,.42)', marginTop: 8 }}>Same muscles — {cur.target}</div>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alts.map(a => (
            <button key={a.name} className="pressable-card" onClick={() => { haptic.select(); dispatch({ type: 'APPLY_SWAP', name: a.name }); }} style={{
              width: '100%', height: 60, borderRadius: 16, border: '1.5px solid rgba(255,255,255,.11)', background: 'transparent',
              color: '#EEF1F4', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', cursor: 'pointer', textAlign: 'left'
            }}>
              <div style={{ flex: 1, fontFamily: 'Chivo,sans-serif', fontSize: 16.5, fontWeight: 700, letterSpacing: '-.02em' }}>{a.name}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(238,241,244,.38)' }}>{a.note}</div>
            </button>
          ))}
        </div>
        <button className="pressable-subtle" onClick={() => { haptic.tap(); dispatch({ type: 'CLOSE_SWAP' }); }} style={{
          width: '100%', height: 50, marginTop: 18, borderRadius: 15, border: 'none', background: 'rgba(255,255,255,.07)',
          color: 'rgba(238,241,244,.7)', fontFamily: 'Chivo,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer'
        }}>Keep it</button>
      </div>
    </div>
  );
}

const stepperBtn = {
  width: 56, height: 58, borderRadius: 17, border: '1.5px solid rgba(255,255,255,.11)', background: 'transparent',
  color: 'rgba(238,241,244,.7)', fontFamily: 'Chivo,sans-serif', fontSize: 24, fontWeight: 700, cursor: 'pointer', lineHeight: 1, flex: 'none'
};
const primaryBtn = {
  width: '100%', height: 58, marginTop: 14, borderRadius: 18, border: 'none', background: ACC, color: '#fff',
  fontFamily: 'Chivo,sans-serif', fontSize: 17, fontWeight: 800, letterSpacing: '-.015em', cursor: 'pointer'
};
