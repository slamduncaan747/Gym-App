import { ACC } from '../store/theme.js';

// Catmull-rom -> cubic bezier smoothing so the strength curve reads as one
// continuous motion instead of a jagged connect-the-dots line.
function smoothPath(pts) {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export default function Chart({ pts, w = 330, h = 130 }) {
  if (!pts || pts.length < 2) return <svg width="100%" viewBox={`0 0 ${w} ${h}`} />;
  const mn = Math.min(...pts), mx = Math.max(...pts), sp = mx - mn || 1;
  const padY = 14;
  const q = pts.map((v, i) => [i * (w / (pts.length - 1)), h - ((v - mn) / sp) * (h - padY * 2) - padY]);
  const line = smoothPath(q);
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = q[q.length - 1];
  const gid = 'chartFill';

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACC} stopOpacity=".28" />
          <stop offset="100%" stopColor={ACC} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={ACC} stopOpacity=".55" />
          <stop offset="100%" stopColor={ACC} stopOpacity="1" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke="url(#chartStroke)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="9" fill={ACC} opacity=".16" />
      <circle cx={last[0]} cy={last[1]} r="5" fill={ACC} stroke="#0E0F12" strokeWidth="2.5" />
    </svg>
  );
}
