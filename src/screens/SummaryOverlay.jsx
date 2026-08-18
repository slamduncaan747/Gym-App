import { useStore } from '../store/StoreContext.jsx';
import { ACC, ACC_TEXT } from '../store/theme.js';
import { toDisplayWeight } from '../lib/format.js';
import { haptic } from '../lib/haptics.js';

export default function SummaryOverlay() {
  const { state, dispatch } = useStore();
  const s = state.lastSummary;
  if (!s) return null;
  const unit = state.weightUnit === 'kg' ? ' kg' : ' lb';
  const volume = Math.round(toDisplayWeight(s.volumeLifted, state.weightUnit) / 100) / 10 + 'k' + unit;
  const stats = [
    { label: 'Sets completed', value: `${s.doneSets} of ${s.totalSets}` },
    { label: 'Time', value: `${s.minutes} min` },
    { label: 'Volume', value: volume }
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#0E0F12', zIndex: 60,
      padding: 'calc(env(safe-area-inset-top, 0px) + 40px) 24px calc(env(safe-area-inset-bottom, 0px) + 24px)',
      display: 'flex', flexDirection: 'column', animation: 'ovFade .3s ease'
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: ACC_TEXT }}>Session complete</div>
        <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-.045em', lineHeight: 1.04, marginTop: 16, textWrap: 'balance' }}>{state.sessionTitle}</div>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {stats.map((st, i) => (
            <div key={st.label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, animation: `ovRise .35s ease ${i * .06}s both` }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(238,241,244,.42)' }}>{st.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.035em' }}>{st.value}</div>
            </div>
          ))}
        </div>
      </div>
      <button className="pressable" onClick={() => { haptic.tap(); dispatch({ type: 'CLOSE_SUMMARY' }); }} style={{
        width: '100%', height: 60, borderRadius: 18, border: 'none', background: ACC, color: '#fff',
        fontFamily: 'Chivo,sans-serif', fontSize: 17, fontWeight: 800, cursor: 'pointer'
      }}>See the numbers</button>
    </div>
  );
}
