import { useEffect, useRef } from 'react';
import { SHEET } from '../store/theme.js';
import { haptic } from '../lib/haptics.js';

const ITEM_H = 46;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2) * ITEM_H;

// An iOS-style wheel picker: a scroll-snapped column of options with a
// fixed highlight band. Selection commits when scrolling settles.
export default function WheelPicker({ options, value, onChange, format }) {
  const ref = useRef(null);
  const timer = useRef(null);
  const didInit = useRef(false);

  useEffect(() => {
    const idx = Math.max(0, options.indexOf(value));
    if (ref.current) ref.current.scrollTop = idx * ITEM_H;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleScroll() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / ITEM_H)));
      el.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
      if (options[idx] !== value) {
        haptic.select();
        onChange(options[idx]);
      } else if (didInit.current) {
        haptic.tap();
      }
      didInit.current = true;
    }, 110);
  }

  return (
    <div style={{ position: 'relative', height: ITEM_H * VISIBLE }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: PAD, height: ITEM_H,
        background: 'rgba(255,255,255,.07)', borderRadius: 14, pointerEvents: 'none'
      }} />
      <div
        ref={ref} onScroll={handleScroll}
        style={{ height: '100%', overflowY: 'auto', scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        <div style={{ height: PAD }} />
        {options.map(o => (
          <div key={String(o)} style={{
            height: ITEM_H, scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 21, fontWeight: 800, letterSpacing: '-.02em', color: '#EEF1F4', fontFamily: 'Chivo,sans-serif'
          }}>{format ? format(o) : o}</div>
        ))}
        <div style={{ height: PAD }} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PAD, background: `linear-gradient(${SHEET}, transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: PAD, background: `linear-gradient(transparent, ${SHEET})`, pointerEvents: 'none' }} />
    </div>
  );
}
