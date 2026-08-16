import { ACC } from '../store/theme.js';

export default function Chart({ pts, w = 330, h = 108 }) {
  if (!pts || pts.length < 2) return <svg width="100%" viewBox={`0 0 ${w} ${h}`} />;
  const mn = Math.min(...pts), mx = Math.max(...pts), sp = mx - mn || 1;
  const q = pts.map((v, i) => [i * (w / (pts.length - 1)), h - ((v - mn) / sp) * (h - 12) - 6]);
  const d = q.map((a, i) => (i ? 'L' : 'M') + a[0].toFixed(1) + ' ' + a[1].toFixed(1)).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
      <path d={d + ` L${w} ${h} L0 ${h} Z`} fill="oklch(0.66 0.17 250 / .12)" />
      <path d={d} fill="none" stroke={ACC} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={q[q.length - 1][0]} cy={q[q.length - 1][1]} r="5" fill={ACC} stroke="#0E0F12" strokeWidth="2.5" />
    </svg>
  );
}
