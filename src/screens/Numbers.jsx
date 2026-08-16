import { useMemo } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { METRICS_META } from '../store/seed.js';
import { deriveMetrics, deriveVolume, deriveWeeks, deriveStreak } from '../store/derive.js';
import { ACC, ACC_TEXT, AMBER } from '../store/theme.js';
import { todayISO, weekdayName } from '../lib/format.js';
import { haptic } from '../lib/haptics.js';
import Chart from '../components/Chart.jsx';

const METRIC_KEYS = ['score', 'Bench', 'Squat', 'Deadlift'];

export default function Numbers() {
  const { state, dispatch } = useStore();
  const todayIso = todayISO();

  const metrics = useMemo(() => deriveMetrics(state.metricPoints, METRICS_META), [state.metricPoints]);
  const volume = useMemo(() => deriveVolume(state.workoutLog, todayIso), [state.workoutLog, todayIso]);
  const weeks = useMemo(() => deriveWeeks(state.workoutLog, todayIso), [state.workoutLog, todayIso]);
  const streak = useMemo(() => deriveStreak(weeks), [weeks]);

  const m = metrics[state.metric];

  return (
    <div className="tab-fade" style={{ padding: '20px 24px 40px' }}>
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,.05)', borderRadius: 15, padding: 4 }}>
        {METRIC_KEYS.map(k => {
          const active = state.metric === k;
          return (
            <button key={k} className="pressable-subtle" onClick={() => { haptic.select(); dispatch({ type: 'SET_METRIC', metric: k }); }} style={{
              flex: 1, height: 40, border: 'none', borderRadius: 11, background: active ? ACC : 'transparent',
              color: active ? '#fff' : 'rgba(238,241,244,.5)', fontFamily: 'Chivo,sans-serif', fontSize: 13.5,
              fontWeight: 700, letterSpacing: '-.01em', cursor: 'pointer'
            }}>{k === 'score' ? 'Score' : k}</button>
          );
        })}
      </div>

      {m ? (
        <>
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 10 }}>
              <div style={{ fontSize: 68, fontWeight: 900, letterSpacing: '-.055em', lineHeight: .86 }}>{m.value}{m.unit}</div>
              {m.pts.length > 1 && <div style={{ fontSize: 16, fontWeight: 700, color: m.up ? ACC_TEXT : 'rgba(238,241,244,.35)', paddingBottom: 10 }}>{m.delta}</div>}
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(238,241,244,.45)', marginTop: 14, maxWidth: '32ch', textWrap: 'pretty' }}>{m.note}</div>
          </div>

          {m.pts.length > 1 && (
            <>
              <div style={{ marginTop: 28 }}><Chart pts={m.pts} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12.5, fontWeight: 600, color: 'rgba(238,241,244,.28)' }}>
                <div>Then</div><div>Now</div>
              </div>
            </>
          )}

          <div style={{ marginTop: 44, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Next milestone</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: ACC_TEXT }}>{m.nextGap}</div>
          </div>
          <div style={{ marginTop: 14, fontSize: 24, fontWeight: 800, letterSpacing: '-.035em' }}>{m.next}</div>
          <div style={{ marginTop: 16, height: 6, borderRadius: 9, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${m.nextPct}%`, background: ACC, borderRadius: 9, transition: 'width .4s ease' }} />
          </div>
        </>
      ) : (
        <div style={{ marginTop: 40, padding: '28px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em' }}>No {state.metric === 'score' ? 'score' : state.metric.toLowerCase()} data yet</div>
          <div style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(238,241,244,.45)', marginTop: 10, maxWidth: '32ch', textWrap: 'pretty' }}>
            {state.metric === 'score' ? 'Log a session on all three main lifts to start your score.' : 'Log a session with this lift and it shows up here.'}
          </div>
        </div>
      )}

      <div style={{ marginTop: 44, fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Weekly sets</div>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {volume.map(v => {
          const bar = v.over ? AMBER : (v.under ? 'rgba(238,241,244,.22)' : ACC);
          const fg = v.over ? AMBER : (v.under ? 'rgba(238,241,244,.38)' : 'rgba(238,241,244,.55)');
          const label = `${v.done} sets${v.under ? ' · under' : (v.over ? ' · over' : '')}`;
          return (
            <div key={v.muscle}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.015em' }}>{v.muscle}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: fg }}>{label}</div>
              </div>
              <div style={{ position: 'relative', height: 7, borderRadius: 9, background: 'rgba(255,255,255,.06)', marginTop: 10, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${v.pct}%`, background: bar, borderRadius: 9, transition: 'width .4s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 44, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.34)' }}>Consistency</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(238,241,244,.38)' }}>{streak} week{streak === 1 ? '' : 's'} clean</div>
      </div>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {weeks.map(wk => (
          <div key={wk.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, fontSize: 12, fontWeight: 600, color: 'rgba(238,241,244,.28)' }}>{wk.label}</div>
            {wk.days.map(d => (
              <div key={d.date} title={weekdayName(d.date, true)} style={{
                flex: 1, height: 20, borderRadius: 6, transition: 'background .3s ease',
                background: d.level === 2 ? ACC : (d.level === 1 ? 'oklch(0.66 0.17 250 / .14)' : 'rgba(255,255,255,.05)')
              }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
