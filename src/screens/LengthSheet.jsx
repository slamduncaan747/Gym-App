import { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { ACC, SHEET } from '../store/theme.js';
import { haptic } from '../lib/haptics.js';
import WheelPicker from '../components/WheelPicker.jsx';

const OPTIONS = ['auto', 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90];

export default function LengthSheet() {
  const { state, dispatch } = useStore();
  const [value, setValue] = useState(state.targetMinutes ?? 'auto');

  const apply = () => {
    haptic.tap();
    dispatch({ type: 'SET_TARGET_MINUTES', minutes: value === 'auto' ? null : value });
    dispatch({ type: 'TOGGLE_LENGTH_SHEET' });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,7,9,.72)', display: 'flex', alignItems: 'flex-end', zIndex: 50, animation: 'ovFade .18s ease' }}>
      <div style={{ width: '100%', background: SHEET, borderRadius: '28px 28px 0 0', padding: `10px 24px calc(env(safe-area-inset-bottom, 0px) + 24px)`, animation: 'ovRise .22s ease' }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.15)', margin: '0 auto 18px' }} />
        <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: '-.03em', textAlign: 'center' }}>Session length</div>
        <div style={{ fontSize: 13.5, color: 'rgba(238,241,244,.42)', marginTop: 6, textAlign: 'center' }}>Sets and exercises adjust to fit.</div>

        <div style={{ marginTop: 8 }}>
          <WheelPicker options={OPTIONS} value={value} onChange={setValue} format={v => v === 'auto' ? 'Auto' : `${v} min`} />
        </div>

        <button className="pressable" onClick={apply} style={{
          width: '100%', height: 58, marginTop: 12, borderRadius: 18, border: 'none', background: ACC, color: '#fff',
          fontFamily: 'Chivo,sans-serif', fontSize: 16.5, fontWeight: 800, cursor: 'pointer'
        }}>Use this length</button>
        <button className="pressable-subtle" onClick={() => { haptic.tap(); dispatch({ type: 'TOGGLE_LENGTH_SHEET' }); }} style={{
          width: '100%', height: 48, marginTop: 8, borderRadius: 15, border: 'none', background: 'transparent',
          color: 'rgba(238,241,244,.5)', fontFamily: 'Chivo,sans-serif', fontSize: 14.5, fontWeight: 700, cursor: 'pointer'
        }}>Cancel</button>
      </div>
    </div>
  );
}
