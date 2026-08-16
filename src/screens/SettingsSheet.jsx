import { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { WEEKDAYS } from '../store/seed.js';
import { ACC, ACC_SOFT, ACC_TEXT } from '../store/theme.js';
import { haptic } from '../lib/haptics.js';

const sectionLabel = { fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' };
const textInput = {
  width: '100%', height: 52, borderRadius: 14, border: '1.5px solid rgba(255,255,255,.13)',
  background: '#191B20', color: '#EEF1F4', fontSize: 16, padding: '0 16px', boxSizing: 'border-box', outline: 'none'
};

export default function SettingsSheet() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState(state.apiKey);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(state.profile.name);
  const [days, setDays] = useState(state.profile.trainingDays);
  const [confirmReset, setConfirmReset] = useState(false);

  const saveKey = () => {
    haptic.tap();
    dispatch({ type: 'SET_API_KEY', apiKey: draft.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };
  const toggleDay = (d) => {
    haptic.select();
    const next = days.includes(d) ? days.filter(x => x !== d) : [...days, d];
    setDays(next);
    dispatch({ type: 'UPDATE_PROFILE', trainingDays: next });
  };
  const saveName = () => dispatch({ type: 'UPDATE_PROFILE', name });

  const resetApp = () => {
    if (!confirmReset) {
      haptic.warning();
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    haptic.warning();
    dispatch({ type: 'RESET_APP' });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,7,9,.72)', display: 'flex', alignItems: 'flex-end', zIndex: 50, animation: 'ovFade .18s ease' }}>
      <div style={{ width: '100%', maxHeight: '85%', overflowY: 'auto', background: '#15171B', borderRadius: '28px 28px 0 0', padding: `26px 24px calc(env(safe-area-inset-bottom, 0px) + 24px)`, animation: 'ovRise .22s ease' }}>
        <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: '-.03em' }}>Settings</div>

        <div style={{ marginTop: 24, ...sectionLabel }}>Name</div>
        <input value={name} onChange={e => setName(e.target.value)} onBlur={saveName} placeholder="First name" style={{ ...textInput, marginTop: 10 }} autoCapitalize="words" autoCorrect="off" />

        <div style={{ marginTop: 22, ...sectionLabel }}>Training days</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {WEEKDAYS.map(d => {
            const on = days.includes(d);
            return (
              <button key={d} className="pressable-subtle" onClick={() => toggleDay(d)} style={{
                width: 'calc(50% - 4px)', height: 44, borderRadius: 12,
                border: `1.5px solid ${on ? ACC : 'rgba(255,255,255,.12)'}`, background: on ? ACC_SOFT : 'transparent',
                color: on ? ACC_TEXT : 'rgba(238,241,244,.7)', fontFamily: 'Chivo,sans-serif', fontSize: 14,
                fontWeight: 700, cursor: 'pointer'
              }}>{d}</button>
            );
          })}
        </div>

        <div style={{ marginTop: 24, ...sectionLabel }}>Coach API key</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(238,241,244,.4)', marginTop: 6 }}>Stored only on this device, sent only to Anthropic's API.</div>
        <input
          type="password" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          value={draft} onChange={e => setDraft(e.target.value)} placeholder="sk-ant-…" style={{ ...textInput, marginTop: 10 }}
        />
        <button className="pressable" onClick={saveKey} style={{
          width: '100%', height: 54, marginTop: 14, borderRadius: 16, border: 'none', background: ACC, color: '#fff',
          fontFamily: 'Chivo,sans-serif', fontSize: 15.5, fontWeight: 800, cursor: 'pointer'
        }}>{saved ? 'Saved' : 'Save key'}</button>

        <div style={{ marginTop: 26, ...sectionLabel }}>Weight unit</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {['lb', 'kg'].map(u => (
            <button key={u} className="pressable-subtle" onClick={() => { haptic.select(); dispatch({ type: 'SET_WEIGHT_UNIT', unit: u }); }} style={{
              flex: 1, height: 44, borderRadius: 12, border: 'none',
              background: state.weightUnit === u ? ACC : 'rgba(255,255,255,.07)',
              color: state.weightUnit === u ? '#fff' : 'rgba(238,241,244,.7)',
              fontFamily: 'Chivo,sans-serif', fontSize: 14.5, fontWeight: 700, cursor: 'pointer'
            }}>{u}</button>
          ))}
        </div>

        <div style={{ marginTop: 26, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={sectionLabel}>Rest between sets</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: ACC_TEXT }}>{state.restSeconds}s</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[90, 120, 150, 180, 240].map(sec => (
            <button key={sec} className="pressable-subtle" onClick={() => { haptic.select(); dispatch({ type: 'SET_REST_SECONDS', seconds: sec }); }} style={{
              flex: 1, height: 40, borderRadius: 11, border: 'none',
              background: state.restSeconds === sec ? ACC : 'rgba(255,255,255,.07)',
              color: state.restSeconds === sec ? '#fff' : 'rgba(238,241,244,.7)',
              fontFamily: 'Chivo,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}>{sec}s</button>
          ))}
        </div>

        <button className="pressable-subtle" onClick={resetApp} style={{
          width: '100%', height: 50, marginTop: 30, borderRadius: 16, border: '1.5px solid rgba(255,80,80,.3)', background: 'transparent',
          color: confirmReset ? '#ff8a8a' : 'rgba(255,120,120,.75)', fontFamily: 'Chivo,sans-serif', fontSize: 14.5, fontWeight: 700, cursor: 'pointer'
        }}>{confirmReset ? 'Tap again to erase everything' : 'Reset app data'}</button>

        <button className="pressable-subtle" onClick={() => { haptic.tap(); dispatch({ type: 'TOGGLE_SETTINGS' }); }} style={{
          width: '100%', height: 50, marginTop: 10, borderRadius: 16, border: 'none', background: 'rgba(255,255,255,.08)',
          color: 'rgba(238,241,244,.75)', fontFamily: 'Chivo,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer'
        }}>Close</button>
      </div>
    </div>
  );
}
