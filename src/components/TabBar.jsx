import { ACC, ACC_TEXT, SURFACE } from '../store/theme.js';

const TABS = [
  { k: 'home', label: 'Today', radius: '4px' },
  { k: 'lab', label: 'Numbers', radius: '99px' },
  { k: 'coach', label: 'Coach', radius: '9px 9px 9px 2px' }
];

export default function TabBar({ tab, unread, onSelect }) {
  return (
    <div style={{
      flex: 'none', background: SURFACE, borderTop: '1px solid rgba(255,255,255,.06)',
      display: 'flex', padding: '0 8px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)', zIndex: 30
    }}>
      {TABS.map(t => {
        const active = tab === t.k;
        const badge = t.k === 'coach' && !active ? unread : 0;
        return (
          <button key={t.k} onClick={() => onSelect(t.k)} style={{
            flex: 1, background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 7, paddingTop: 12, height: 68, color: active ? ACC_TEXT : 'rgba(238,241,244,.33)', position: 'relative'
          }}>
            <span style={{
              width: 13, height: 13, borderRadius: t.radius, border: '2.5px solid currentColor',
              background: active ? ACC : 'transparent', display: 'block'
            }} />
            <span style={{ fontFamily: 'Chivo,sans-serif', fontSize: 11.5, fontWeight: 700, letterSpacing: '-.01em' }}>{t.label}</span>
            {badge > 0 && (
              <span style={{
                position: 'absolute', top: 8, right: 30, minWidth: 17, height: 17, borderRadius: 99,
                background: ACC, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxSizing: 'border-box'
              }}>{badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
