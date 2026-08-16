import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { STARTER_PROMPTS } from '../store/seed.js';
import { deriveVolume, deriveWeeks, deriveStreak } from '../store/derive.js';
import { askCoach, CoachError } from '../lib/claude.js';
import { ACC, ACC_TEXT, BUBBLE } from '../store/theme.js';
import { todayISO, weekdayName, dayLabel, uid } from '../lib/format.js';

export default function Coach() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const todayIso = todayISO();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.chatThread.length, state.typing]);

  async function send(text) {
    const t = text.trim();
    if (!t) return;
    setDraft('');
    if (!state.apiKey) { dispatch({ type: 'TOGGLE_SETTINGS' }); return; }

    dispatch({ type: 'APPEND_MESSAGE', message: { id: uid(), ts: todayIso, me: true, text: t, saved: null, action: null, actionConsumed: false } });
    dispatch({ type: 'SET_TYPING', typing: true });

    const weeks = deriveWeeks(state.workoutLog, todayIso);
    const context = {
      today: todayIso,
      weekday: weekdayName(todayIso),
      planTitle: state.plan,
      recentSessions: [...state.workoutLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
      volume: deriveVolume(state.workoutLog, todayIso),
      streak: deriveStreak(weeks),
      memories: state.memories
    };

    const savedNotes = [];
    try {
      const result = await askCoach({
        apiKey: state.apiKey,
        context,
        history: state.chatThread.slice(-16).map(m => ({ me: m.me, text: m.text })),
        userText: t,
        onToolEffect: (effect) => {
          if (effect.type === 'save_memory') {
            dispatch({ type: 'ADD_MEMORY', text: effect.input.text, category: effect.input.category, expiresInDays: effect.input.expires_in_days, todayIso });
            savedNotes.push(effect.input.text);
          }
        }
      });
      dispatch({
        type: 'APPEND_MESSAGE', message: {
          id: uid(), ts: todayIso, me: false, text: result.text,
          saved: savedNotes[0] || null,
          action: result.action ? { label: result.action.label, plan: result.action.plan, rationale: result.action.rationale } : null,
          actionConsumed: false
        }
      });
    } catch (err) {
      const msg = err instanceof CoachError && err.message === 'auth'
        ? "That API key didn't work — check it in Settings."
        : "Couldn't reach Coach — check your connection and try again.";
      dispatch({ type: 'APPEND_MESSAGE', message: { id: uid(), ts: todayIso, me: false, text: msg, saved: null, action: null, actionConsumed: false } });
    } finally {
      dispatch({ type: 'SET_TYPING', typing: false });
    }
  }

  const lastSession = [...state.workoutLog].sort((a, b) => b.date.localeCompare(a.date))[0];
  const status = state.typing ? 'typing…' : (lastSession ? `read your ${dayLabel(lastSession.date, todayIso).toLowerCase()} session` : 'ready when you are');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 99, background: ACC, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flex: 'none' }}>C</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '-.02em' }}>Coach</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(238,241,244,.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{status}</div>
        </div>
        <button onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })} style={iconBtn} aria-label="Coach settings">⚙</button>
        <button onClick={() => dispatch({ type: 'TOGGLE_MEMORY' })} style={{ ...pillBtn, color: state.memoryOpen ? ACC_TEXT : 'rgba(238,241,244,.7)' }}>Memory {state.memories.length}</button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {state.chatThread.map((m, i) => {
          const prev = state.chatThread[i - 1];
          const showDay = !prev || prev.ts !== m.ts;
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.me ? 'flex-end' : 'flex-start', gap: 5 }}>
              {showDay && <div style={{ alignSelf: 'center', fontSize: 12.5, fontWeight: 600, color: 'rgba(238,241,244,.28)', padding: '8px 0' }}>{dayLabel(m.ts, todayIso)}</div>}
              <div style={{
                maxWidth: '80%', padding: '13px 16px', borderRadius: m.me ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                background: m.me ? ACC : BUBBLE, color: m.me ? '#fff' : 'rgba(238,241,244,.9)', fontSize: 15, lineHeight: 1.55, textWrap: 'pretty'
              }}>{m.text}</div>
              {m.saved && <div style={{ fontSize: 12.5, fontWeight: 600, color: 'oklch(0.72 0.16 245)', paddingLeft: 4 }}>Saved to memory · {m.saved}</div>}
              {m.action && !m.actionConsumed && (
                <button onClick={() => dispatch({ type: 'CONSUME_ACTION', id: m.id })} style={{
                  marginTop: 4, height: 46, padding: '0 20px', borderRadius: 14, border: 'none', background: ACC,
                  color: '#fff', fontFamily: 'Chivo,sans-serif', fontSize: 15, fontWeight: 800, cursor: 'pointer', animation: 'ovRise .3s ease'
                }}>{m.action.label}</button>
              )}
            </div>
          );
        })}
        {state.typing && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 5, padding: '15px 17px', borderRadius: '20px 20px 20px 6px', background: BUBBLE }}>
            {[0, .2, .4].map(delay => (
              <span key={delay} style={{ width: 6, height: 6, borderRadius: 99, background: 'rgba(238,241,244,.6)', animation: `ovPulse 1.1s ${delay}s infinite` }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '6px 20px 0', display: 'flex', gap: 9, overflowX: 'auto' }}>
        {STARTER_PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)} style={{
            flex: 'none', height: 38, padding: '0 15px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,.13)',
            background: 'transparent', color: 'rgba(238,241,244,.65)', fontFamily: 'Chivo,sans-serif', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{p}</button>
        ))}
      </div>

      <form onSubmit={e => { e.preventDefault(); send(draft); }} style={{ padding: '12px 20px calc(env(safe-area-inset-bottom, 0px) + 14px)', display: 'flex', gap: 10 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={state.apiKey ? 'Message Coach' : 'Add an API key in Settings to chat'}
          style={{
            flex: 1, height: 50, borderRadius: 18, background: BUBBLE, border: 'none', color: '#EEF1F4',
            fontSize: 15, padding: '0 18px', outline: 'none'
          }}
        />
        <button type="submit" disabled={!draft.trim()} style={{
          flex: 'none', width: 50, height: 50, borderRadius: 18, border: 'none', background: draft.trim() ? ACC : 'rgba(255,255,255,.08)',
          color: '#fff', fontSize: 18, fontWeight: 800, cursor: draft.trim() ? 'pointer' : 'default'
        }}>↑</button>
      </form>
    </div>
  );
}

const iconBtn = {
  flex: 'none', width: 36, height: 36, borderRadius: 12, border: '1.5px solid rgba(255,255,255,.13)', background: 'transparent',
  color: 'rgba(238,241,244,.65)', fontSize: 15, cursor: 'pointer'
};
const pillBtn = {
  background: 'none', border: '1.5px solid rgba(255,255,255,.13)', borderRadius: 12, height: 36, padding: '0 14px',
  fontFamily: 'Chivo,sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', flex: 'none', whiteSpace: 'nowrap'
};
