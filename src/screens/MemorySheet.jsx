import { useStore } from '../store/StoreContext.jsx';
import { AMBER } from '../store/theme.js';

export default function MemorySheet() {
  const { state, dispatch } = useStore();
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,7,9,.72)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
      <div style={{ width: '100%', maxHeight: '78%', overflowY: 'auto', background: '#15171B', borderRadius: '28px 28px 0 0', padding: `26px 24px calc(env(safe-area-inset-bottom, 0px) + 24px)`, animation: 'ovRise .22s ease' }}>
        <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: '-.03em' }}>What Coach remembers</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(238,241,244,.45)', marginTop: 8, textWrap: 'pretty' }}>Used when building sessions and deciding what to bring up.</div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {state.memories.length === 0 && (
            <div style={{ fontSize: 14.5, color: 'rgba(238,241,244,.4)' }}>Nothing saved yet — tell Coach about an injury, goal, or schedule and it'll show up here.</div>
          )}
          {state.memories.map(m => (
            <div key={m.id}>
              <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.015em', textWrap: 'pretty' }}>{m.text}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: m.category === 'long_term' ? 'rgba(238,241,244,.38)' : AMBER, marginTop: 5 }}>{m.tag}</div>
            </div>
          ))}
        </div>
        <button onClick={() => dispatch({ type: 'TOGGLE_MEMORY' })} style={{
          width: '100%', height: 50, marginTop: 28, borderRadius: 16, border: 'none', background: 'rgba(255,255,255,.08)',
          color: 'rgba(238,241,244,.75)', fontFamily: 'Chivo,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer'
        }}>Close</button>
      </div>
    </div>
  );
}
