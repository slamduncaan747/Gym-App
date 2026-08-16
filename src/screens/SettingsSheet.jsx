import { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { ACC, ACC_TEXT } from '../store/theme.js';

export default function SettingsSheet() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState(state.apiKey);
  const [saved, setSaved] = useState(false);

  const save = () => {
    dispatch({ type: 'SET_API_KEY', apiKey: draft.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,7,9,.72)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
      <div style={{ width: '100%', background: '#15171B', borderRadius: '28px 28px 0 0', padding: `26px 24px calc(env(safe-area-inset-bottom, 0px) + 24px)`, animation: 'ovRise .22s ease' }}>
        <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: '-.03em' }}>Coach settings</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(238,241,244,.45)', marginTop: 8, textWrap: 'pretty' }}>
          Your Claude API key, stored only on this device and sent only to Anthropic's API.
        </div>

        <div style={{ marginTop: 22, fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>API key</div>
        <input
          type="password"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="sk-ant-…"
          style={{
            width: '100%', height: 52, marginTop: 10, borderRadius: 14, border: '1.5px solid rgba(255,255,255,.13)',
            background: '#191B20', color: '#EEF1F4', fontSize: 15, padding: '0 16px', boxSizing: 'border-box', outline: 'none'
          }}
        />
        <button onClick={save} style={{
          width: '100%', height: 54, marginTop: 14, borderRadius: 16, border: 'none', background: ACC, color: '#fff',
          fontFamily: 'Chivo,sans-serif', fontSize: 15.5, fontWeight: 800, cursor: 'pointer'
        }}>{saved ? 'Saved' : 'Save key'}</button>

        <div style={{ marginTop: 26, fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Weight unit</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {['lb', 'kg'].map(u => (
            <button key={u} onClick={() => dispatch({ type: 'SET_WEIGHT_UNIT', unit: u })} style={{
              flex: 1, height: 44, borderRadius: 12, border: 'none',
              background: state.weightUnit === u ? ACC : 'rgba(255,255,255,.07)',
              color: state.weightUnit === u ? '#fff' : 'rgba(238,241,244,.7)',
              fontFamily: 'Chivo,sans-serif', fontSize: 14.5, fontWeight: 700, cursor: 'pointer'
            }}>{u}</button>
          ))}
        </div>

        <div style={{ marginTop: 26, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Rest between sets</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: ACC_TEXT }}>{state.restSeconds}s</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[90, 120, 150, 180, 240].map(sec => (
            <button key={sec} onClick={() => dispatch({ type: 'SET_REST_SECONDS', seconds: sec })} style={{
              flex: 1, height: 40, borderRadius: 11, border: 'none',
              background: state.restSeconds === sec ? ACC : 'rgba(255,255,255,.07)',
              color: state.restSeconds === sec ? '#fff' : 'rgba(238,241,244,.7)',
              fontFamily: 'Chivo,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}>{sec}s</button>
          ))}
        </div>

        <button onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })} style={{
          width: '100%', height: 50, marginTop: 26, borderRadius: 16, border: 'none', background: 'rgba(255,255,255,.08)',
          color: 'rgba(238,241,244,.75)', fontFamily: 'Chivo,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer'
        }}>Close</button>
      </div>
    </div>
  );
}
