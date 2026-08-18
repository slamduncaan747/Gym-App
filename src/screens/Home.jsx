import { useStore } from '../store/StoreContext.jsx';
import { PIVOTS } from '../store/exercises.js';
import { ACC, ACC_SOFT, ACC_TEXT } from '../store/theme.js';
import { todayISO, weekdayName, weekOfProgram } from '../lib/format.js';
import { haptic } from '../lib/haptics.js';

export default function Home() {
  const { state, dispatch } = useStore();
  const todayIso = todayISO();
  const plan = state.todayPlan;
  const { week, of } = weekOfProgram(state.programStartDate, todayIso);
  const paused = state.session === 'paused';

  const startWorkout = () => {
    haptic.success();
    dispatch({ type: paused ? 'RESUME_SESSION' : 'START_SESSION' });
  };
  const pickPivot = (k) => {
    haptic.select();
    dispatch({ type: 'SET_PIVOT', pivot: k });
  };

  if (!plan) return null;

  return (
    <div className="tab-fade" style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {paused && (
        <>
          <button className="pressable" onClick={() => { haptic.tap(); dispatch({ type: 'RESUME_SESSION' }); }} style={{
            width: '100%', border: 'none', borderRadius: 18, background: 'oklch(0.66 0.17 250 / .16)',
            padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
            fontFamily: 'Chivo,sans-serif', textAlign: 'left', marginBottom: 26, animation: 'ovRise .22s ease'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: ACC, animation: 'ovPulse 1.6s infinite', flex: 'none' }} />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: '#EEF1F4' }}>Session paused</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: ACC_TEXT }}>Resume</span>
          </button>
          <button className="pressable-subtle" onClick={() => { haptic.warning(); dispatch({ type: 'DISCARD_SESSION' }); }} style={{
            alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, margin: '-16px 0 26px',
            fontFamily: 'Chivo,sans-serif', fontSize: 13.5, fontWeight: 600, color: 'rgba(238,241,244,.55)', cursor: 'pointer'
          }}>Discard session</button>
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>{weekdayName(todayIso)}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Week {week} of {of}</div>
      </div>

      <div style={{ marginTop: 40 }}>
        <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-.045em', lineHeight: 1.02, textWrap: 'balance' }}>{plan.title}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(238,241,244,.45)', marginTop: 12 }}>{plan.estSets} sets · about {plan.estMinutes} minutes</div>
      </div>

      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {plan.lifts.map((lift, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>{lift.name}</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'rgba(238,241,244,.38)' }}>{lift.scheme}</div>
          </div>
        ))}
      </div>

      {plan.note && (
        <div style={{ marginTop: 28, fontSize: 14, lineHeight: 1.6, color: 'rgba(238,241,244,.45)', animation: 'ovFade .3s ease', textWrap: 'pretty', maxWidth: '34ch' }}>{plan.note}</div>
      )}

      <div style={{ flex: 1, minHeight: 36 }} />

      <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 16 }}>
        {PIVOTS.map(c => {
          const on = state.pivot === c.k;
          return (
            <button key={c.k} className="pressable-subtle" onClick={() => pickPivot(c.k)} style={{
              flex: 'none', height: 42, padding: '0 16px', borderRadius: 14,
              border: `1.5px solid ${on ? ACC : 'rgba(255,255,255,.12)'}`, background: on ? ACC_SOFT : 'transparent',
              color: on ? ACC_TEXT : 'rgba(238,241,244,.7)', fontFamily: 'Chivo,sans-serif', fontSize: 14,
              fontWeight: 600, letterSpacing: '-.01em', cursor: 'pointer', whiteSpace: 'nowrap'
            }}>{c.label}</button>
          );
        })}
      </div>

      <button className="pressable" onClick={startWorkout} style={{
        width: '100%', height: 66, border: 'none', borderRadius: 20, background: ACC, color: '#fff',
        fontFamily: 'Chivo,sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', cursor: 'pointer'
      }}>{paused ? 'Resume session' : 'Start workout'}</button>
    </div>
  );
}
