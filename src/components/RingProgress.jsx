import { ACC } from '../store/theme.js';

export default function RingProgress({ pct, size = 64, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none', transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ACC} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (clamped / 100) * c} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.2,.8,.2,1)' }}
      />
    </svg>
  );
}
