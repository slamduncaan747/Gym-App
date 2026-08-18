import { useStore } from '../store/StoreContext.jsx';
import { PIVOTS } from '../store/exercises.js';
import { ACC, ACC_SOFT, ACC_TEXT } from '../store/theme.js';
import { todayISO, weekdayName, weekOfProgram } from '../lib/format.js';
import { haptic } from '../lib/haptics.js';

const MAX_LIFTS_SHOWN = 4;

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
  const openLength = () => { haptic.tap(); dispatch({ type: 'TOGGLE_LENGTH_SHEET' }); };

  if (!plan) return null;

  const shownLifts = plan.lifts.slice(0, MAX_LIFTS_SHOWN);
  const extra = plan.lifts.length - shownLifts.length;

  return (
    <div className="tab-fade" style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      {paused && (
        <>
          <button className="pressable" onClick={() => { haptic.tap(); dispatch({ type: 'RESUME_SESSION' }); }} style={{
            width: '100%', border: 'none', borderRadius: 18, background: 'oklch(0.66 0.17 250 / .16)',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
            fontFamily: 'Chivo,sans-serif', textAlign: 'left', marginBottom: 18, animation: 'ovRise .22s ease', flex: 'none'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: ACC, animation: 'ovPulse 1.6s infinite', flex: 'none' }} />
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, letterSpacing: '-.02em', color: '#EEF1F4' }}>Session paused</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: ACC_TEXT }}>Resume</span>
          </button>
          <button className="pressable-subtle" onClick={() => { haptic.warning(); dispatch({ type: 'DISCARD_SESSION' }); }} style={{
            alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, margin: '-10px 0 18px',
            fontFamily: 'Chivo,sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(238,241,244,.55)', cursor: 'pointer', flex: 'none'
          }}>Discard session</button>
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 'none' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>{weekdayName(todayIso)}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Week {week} of {of}</div>
      </div>

      <div style={{ marginTop: 'clamp(20px, 4vh, 40px)', flex: 'none' }}>
        <div style={{ fontSize: 'clamp(30px, 8vh, 38px)', fontWeight: 900, letterSpacing: '-.045em', lineHeight: 1.02, textWrap: 'balance' }}>{plan.title}</div>
        <button className="pressable-subtle" onClick={openLength} style={{
          background: 'none', border: 'none', padding: 0, marginTop: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <span style={{ fontSize: 15.5, fontWeight: 600, color: 'rgba(238,241,244,.45)', fontFamily: 'Chivo,sans-serif' }}>
            {plan.estSets} sets · about {plan.estMinutes} minutes{state.targetMinutes ? ' · custom' : ''}
          </span>
          <span style={{ fontSize: 12, color: ACC_TEXT, fontWeight: 700 }}>Adjust</span>
        </button>
      </div>

      <div style={{ marginTop: 'clamp(16px, 4vh, 32px)', display: 'flex', flexDirection: 'column', gap: 14, flex: 'none' }}>
        {shownLifts.map((lift, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-.02em' }}>{lift.name}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(238,241,244,.38)' }}>{lift.scheme}</div>
          </div>
        ))}
        {extra > 0 && (
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(238,241,244,.3)' }}>+{extra} more exercise{extra === 1 ? '' : 's'}</div>
        )}
      </div>

      {plan.note && (
        <div style={{ marginTop: 18, fontSize: 13.5, lineHeight: 1.55, color: 'rgba(238,241,244,.45)', animation: 'ovFade .3s ease', textWrap: 'pretty', maxWidth: '34ch', flex: 'none' }}>{plan.note}</div>
      )}

      <div style={{ flex: 1, minHeight: 12 }} />

      <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 14, flex: 'none' }}>
        {PIVOTS.map(c => {
          const on = state.pivot === c.k;
          return (
            <button key={c.k} className="pressable-subtle" onClick={() => pickPivot(c.k)} style={{
              flex: 'none', height: 40, padding: '0 15px', borderRadius: 13,
              border: `1.5px solid ${on ? ACC : 'rgba(255,255,255,.12)'}`, background: on ? ACC_SOFT : 'transparent',
              color: on ? ACC_TEXT : 'rgba(238,241,244,.7)', fontFamily: 'Chivo,sans-serif', fontSize: 13.5,
              fontWeight: 600, letterSpacing: '-.01em', cursor: 'pointer', whiteSpace: 'nowrap'
            }}>{c.label}</button>
          );
        })}
      </div>

      <button className="pressable" onClick={startWorkout} style={{
        width: '100%', height: 62, border: 'none', borderRadius: 20, background: ACC, color: '#fff',
        fontFamily: 'Chivo,sans-serif', fontSize: 19, fontWeight: 800, letterSpacing: '-.02em', cursor: 'pointer', flex: 'none'
      }}>{paused ? 'Resume session' : 'Start workout'}</button>
    </div>
  );
}
