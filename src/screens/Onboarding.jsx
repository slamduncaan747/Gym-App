import { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { WEEKDAYS, DEFAULT_TRAINING_DAYS, BEGINNER_MAXES } from '../store/seed.js';
import { ACC, ACC_TEXT, ACC_SOFT, BUBBLE } from '../store/theme.js';
import { todayISO } from '../lib/format.js';
import { haptic } from '../lib/haptics.js';

const STEPS = ['welcome', 'profile', 'days', 'maxes', 'notes', 'coach'];

const inputStyle = {
  width: '100%', height: 56, borderRadius: 16, border: '1.5px solid rgba(255,255,255,.13)',
  background: BUBBLE, color: '#EEF1F4', fontSize: 16, padding: '0 18px', boxSizing: 'border-box', outline: 'none'
};
const labelStyle = { fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.4)' };
const primaryBtn = {
  width: '100%', height: 62, border: 'none', borderRadius: 19, background: ACC, color: '#fff',
  fontFamily: 'Chivo,sans-serif', fontSize: 17.5, fontWeight: 800, letterSpacing: '-.015em', cursor: 'pointer'
};
const ghostBtn = {
  width: '100%', height: 50, border: 'none', borderRadius: 16, background: 'transparent', color: 'rgba(238,241,244,.5)',
  fontFamily: 'Chivo,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8
};

export default function Onboarding() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('lb');
  const [days, setDays] = useState(DEFAULT_TRAINING_DAYS);
  const [newLifter, setNewLifter] = useState(null); // null = undecided, true/false once chosen
  const [maxBench, setMaxBench] = useState('');
  const [maxSquat, setMaxSquat] = useState('');
  const [maxDead, setMaxDead] = useState('');
  const [notes, setNotes] = useState('');
  const [apiKey, setApiKey] = useState('');

  const go = (n) => { haptic.tap(); setStep(n); };
  const toggleDay = (d) => {
    haptic.select();
    setDays(v => v.includes(d) ? v.filter(x => x !== d) : [...v, d]);
  };

  function finish() {
    haptic.success();
    const maxes = newLifter
      ? { ...BEGINNER_MAXES }
      : {
        Bench: parseFloat(maxBench) || 0,
        Squat: parseFloat(maxSquat) || 0,
        Deadlift: parseFloat(maxDead) || 0
      };
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      name, weightUnit: unit, trainingDays: days, maxes, notes, apiKey: apiKey.trim(),
      todayIso: todayISO()
    });
  }

  const dots = step > 0 && (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '18px 0 0' }}>
      {STEPS.slice(1).map((s, i) => (
        <div key={s} style={{ width: i + 1 === step ? 18 : 6, height: 6, borderRadius: 99, background: i + 1 === step ? ACC : 'rgba(255,255,255,.15)', transition: 'all .25s ease' }} />
      ))}
    </div>
  );

  return (
    <div style={{
      height: '100dvh', width: '100vw', background: '#0A0B0D', color: '#EEF1F4',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
    }}>
      {dots}
      <div key={step} style={{
        flex: 1, minHeight: 0, overflowY: 'auto', padding: '28px 28px calc(env(safe-area-inset-bottom, 0px) + 28px)',
        display: 'flex', flexDirection: 'column', animation: 'ovSlideUp .32s cubic-bezier(.2,.8,.2,1)'
      }}>
        {STEPS[step] === 'welcome' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: ACC_SOFT, display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 28
            }}>
              <div style={{ width: 26, height: 26, borderRadius: 99, border: '4px solid ' + ACC, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 5, height: 11, borderRadius: 3, background: ACC }} />
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: ACC_TEXT }}>Overload</div>
            <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.05, marginTop: 14, textWrap: 'balance' }}>
              A workout is a state, not a tab.
            </div>
            <div style={{ fontSize: 15.5, lineHeight: 1.65, color: 'rgba(238,241,244,.5)', marginTop: 18, maxWidth: '34ch', textWrap: 'pretty' }}>
              Thirty seconds of setup, then it stays out of your way — one plan, one button, one number to hit per set.
            </div>
          </div>
        )}

        {STEPS[step] === 'profile' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em' }}>What should Coach call you?</div>
              <div style={{ fontSize: 14.5, color: 'rgba(238,241,244,.45)', marginTop: 8 }}>Optional — skip if you'd rather not say.</div>
            </div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="First name" style={inputStyle} autoCapitalize="words" autoCorrect="off" />
            <div>
              <div style={labelStyle}>Weight unit</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {['lb', 'kg'].map(u => (
                  <button key={u} className="pressable-subtle" onClick={() => { haptic.select(); setUnit(u); }} style={{
                    flex: 1, height: 50, borderRadius: 14, border: 'none',
                    background: unit === u ? ACC : 'rgba(255,255,255,.06)', color: unit === u ? '#fff' : 'rgba(238,241,244,.7)',
                    fontFamily: 'Chivo,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer'
                  }}>{u}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {STEPS[step] === 'days' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em' }}>Which days do you train?</div>
              <div style={{ fontSize: 14.5, color: 'rgba(238,241,244,.45)', marginTop: 8, textWrap: 'pretty' }}>Coach uses this to judge your consistency — change it anytime in Settings.</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {WEEKDAYS.map(d => {
                const on = days.includes(d);
                return (
                  <button key={d} className="pressable-subtle" onClick={() => toggleDay(d)} style={{
                    width: 'calc(50% - 5px)', height: 54, borderRadius: 15,
                    border: `1.5px solid ${on ? ACC : 'rgba(255,255,255,.12)'}`, background: on ? ACC_SOFT : 'transparent',
                    color: on ? ACC_TEXT : 'rgba(238,241,244,.7)', fontFamily: 'Chivo,sans-serif', fontSize: 15.5,
                    fontWeight: 700, cursor: 'pointer'
                  }}>{d}</button>
                );
              })}
            </div>
          </div>
        )}

        {STEPS[step] === 'maxes' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em' }}>Where are you starting from?</div>
              <div style={{ fontSize: 14.5, color: 'rgba(238,241,244,.45)', marginTop: 8, textWrap: 'pretty' }}>Current working weight or best estimate — this sets your starting plan, and it adjusts automatically as you log real sets.</div>
            </div>
            {!newLifter && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Bench press', maxBench, setMaxBench], ['Squat', maxSquat, setMaxSquat], ['Deadlift', maxDead, setMaxDead]].map(([label, val, setter]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{label}</div>
                    <input
                      value={val} onChange={e => setter(e.target.value.replace(/[^0-9.]/g, ''))}
                      inputMode="decimal" placeholder="0" style={{ ...inputStyle, width: 108, height: 50, textAlign: 'right', paddingRight: 14 }}
                    />
                    <div style={{ fontSize: 14, color: 'rgba(238,241,244,.4)', width: 20 }}>{unit}</div>
                  </div>
                ))}
              </div>
            )}
            <button className="pressable-subtle" onClick={() => { haptic.select(); setNewLifter(v => !v); }} style={{
              alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: 'Chivo,sans-serif', fontSize: 14, fontWeight: 700, color: newLifter ? ACC_TEXT : 'rgba(238,241,244,.45)'
            }}>{newLifter ? '✓ Starting with conservative beginner weights' : "I'm new to lifting — start me conservative"}</button>
          </div>
        )}

        {STEPS[step] === 'notes' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em' }}>Anything Coach should know?</div>
              <div style={{ fontSize: 14.5, color: 'rgba(238,241,244,.45)', marginTop: 8, textWrap: 'pretty' }}>Injuries, equipment limits, a goal you're chasing. Optional — you can always tell Coach later.</div>
            </div>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. tweaky left shoulder, home gym with dumbbells only, training for a 2x bodyweight squat"
              rows={5}
              style={{ ...inputStyle, height: 'auto', padding: 16, lineHeight: 1.5, resize: 'none' }}
            />
          </div>
        )}

        {STEPS[step] === 'coach' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em' }}>Set up Coach</div>
              <div style={{ fontSize: 14.5, color: 'rgba(238,241,244,.45)', marginTop: 8, textWrap: 'pretty' }}>
                Coach talks to Claude directly using your own API key — stored only on this device. Optional; add it anytime in Settings.
              </div>
            </div>
            <input
              type="password" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-…" style={inputStyle}
            />
          </div>
        )}
      </div>

      <div style={{ flex: 'none', padding: '0 28px calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
        {step < STEPS.length - 1 ? (
          <button className="pressable" onClick={() => go(step + 1)} style={primaryBtn}>
            {step === 0 ? 'Get started' : 'Continue'}
          </button>
        ) : (
          <button className="pressable" onClick={finish} style={primaryBtn}>Start training</button>
        )}
        {step > 0 && (
          <button className="pressable-subtle" onClick={() => go(step - 1)} style={ghostBtn}>Back</button>
        )}
      </div>
    </div>
  );
}
