import { useMemo } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { METRICS_META } from '../store/seed.js';
import { deriveMetrics, deriveVolume, deriveWeeks, deriveStreak } from '../store/derive.js';
import { ACC, ACC_TEXT, AMBER } from '../store/theme.js';
import { todayISO, weekdayName } from '../lib/format.js';
import { haptic } from '../lib/haptics.js';
import Chart from '../components/Chart.jsx';
import RingProgress from '../components/RingProgress.jsx';

const METRIC_KEYS = ['score', 'Bench', 'Squat', 'Deadlift'];

const card = { background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 24, padding: '22px 20px' };
const sectionLabel = { fontSize: 12.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(238,241,244,.36)' };

export default function Numbers() {
  const { state, dispatch } = useStore();
  const todayIso = todayISO();

  const metrics = useMemo(() => deriveMetrics(state.metricPoints, METRICS_META), [state.metricPoints]);
  const volume = useMemo(() => deriveVolume(state.workoutLog, todayIso), [state.workoutLog, todayIso]);
  const weeks = useMemo(() => deriveWeeks(state.workoutLog, todayIso), [state.workoutLog, todayIso]);
  const streak = useMemo(() => deriveStreak(weeks), [weeks]);

  const m = metrics[state.metric];
  const activeIdx = METRIC_KEYS.indexOf(state.metric);

  return (
    <div className="tab-fade" style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ position: 'relative', display: 'flex', background: 'rgba(255,255,255,.05)', borderRadius: 15, padding: 4 }}>
        <div style={{
          position: 'absolute', top: 4, bottom: 4, left: `calc(${activeIdx * 25}% + 4px)`, width: 'calc(25% - 8px)',
          background: ACC, borderRadius: 11, transition: 'left .25s cubic-bezier(.2,.8,.2,1)'
        }} />
        {METRIC_KEYS.map(k => {
          const active = state.metric === k;
          return (
            <button key={k} onClick={() => { haptic.select(); dispatch({ type: 'SET_METRIC', metric: k }); }} style={{
              position: 'relative', zIndex: 1, flex: 1, height: 40, border: 'none', background: 'transparent',
              color: active ? '#fff' : 'rgba(238,241,244,.5)', fontFamily: 'Chivo,sans-serif', fontSize: 13.5,
              fontWeight: 700, letterSpacing: '-.01em', cursor: 'pointer', transition: 'color .2s ease'
            }}>{k === 'score' ? 'Score' : k}</button>
          );
        })}
      </div>

      {m ? (
        <div style={{ ...card, animation: 'ovFade .2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={sectionLabel}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 10 }}>
                <div style={{ fontSize: 60, fontWeight: 900, letterSpacing: '-.05em', lineHeight: .86 }}>{m.value}{m.unit}</div>
                {m.pts.length > 1 && <div style={{ fontSize: 15.5, fontWeight: 700, color: m.up ? ACC_TEXT : 'rgba(238,241,244,.35)', paddingBottom: 8 }}>{m.delta}</div>}
              </div>
            </div>
            {m.pts.length > 0 && (
              <div style={{ position: 'relative', flex: 'none' }}>
                <RingProgress pct={m.nextPct} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: ACC_TEXT }}>{m.nextPct}%</div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(238,241,244,.45)', marginTop: 10, maxWidth: '32ch', textWrap: 'pretty' }}>{m.note}</div>

          {m.pts.length > 1 && (
            <>
              <div style={{ marginTop: 22 }}><Chart pts={m.pts} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, fontWeight: 600, color: 'rgba(238,241,244,.28)' }}>
                <div>Then</div><div>Now</div>
              </div>
            </>
          )}

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={sectionLabel}>Next milestone</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: ACC_TEXT }}>{m.nextGap}</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 21, fontWeight: 800, letterSpacing: '-.03em' }}>{m.next}</div>
            <div style={{ marginTop: 12, height: 6, borderRadius: 9, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${m.nextPct}%`, background: `linear-gradient(90deg, oklch(0.6 0.17 250), ${ACC})`, borderRadius: 9, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={card}>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.03em' }}>No {state.metric === 'score' ? 'score' : state.metric.toLowerCase()} data yet</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(238,241,244,.45)', marginTop: 10, maxWidth: '32ch', textWrap: 'pretty' }}>
            {state.metric === 'score' ? 'Log a session on all three main lifts to start your score.' : 'Log a session with this lift and it shows up here.'}
          </div>
        </div>
      )}

      <div style={card}>
        <div style={sectionLabel}>Weekly sets</div>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {volume.map(v => {
            const bar = v.over ? AMBER : (v.under ? 'rgba(238,241,244,.24)' : ACC);
            const fg = v.over ? AMBER : (v.under ? 'rgba(238,241,244,.4)' : 'rgba(238,241,244,.6)');
            const label = `${v.done}${v.under ? ' · under' : (v.over ? ' · over' : '')}`;
            const cap = v.mrv * 1.15;
            const mevPct = Math.min(100, (v.mev / cap) * 100);
            const mrvPct = Math.min(100, (v.mrv / cap) * 100);
            return (
              <div key={v.muscle}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>{v.muscle}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: fg }}>{label}</div>
                </div>
                <div style={{ position: 'relative', height: 7, borderRadius: 9, background: 'rgba(255,255,255,.06)', marginTop: 9, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${v.pct}%`, background: bar, borderRadius: 9, transition: 'width .4s ease' }} />
                  <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${mevPct}%`, width: 1.5, background: 'rgba(10,11,13,.55)' }} />
                  <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${mrvPct}%`, width: 1.5, background: 'rgba(10,11,13,.55)' }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, fontSize: 11.5, fontWeight: 600, color: 'rgba(238,241,244,.28)' }}>Marks show minimum and maximum effective weekly sets.</div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={sectionLabel}>Consistency</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(238,241,244,.4)' }}>{streak} week{streak === 1 ? '' : 's'} clean</div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {weeks.map(wk => (
            <div key={wk.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 26, fontSize: 11.5, fontWeight: 600, color: 'rgba(238,241,244,.28)' }}>{wk.label}</div>
              {wk.days.map(d => (
                <div key={d.date} title={weekdayName(d.date, true)} style={{
                  flex: 1, height: 19, borderRadius: 6, transition: 'background .3s ease',
                  background: d.level === 2 ? ACC : (d.level === 1 ? 'oklch(0.66 0.17 250 / .16)' : 'rgba(255,255,255,.05)')
                }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          {[['Full', ACC], ['Light', 'oklch(0.66 0.17 250 / .16)'], ['Rest', 'rgba(255,255,255,.05)']].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: color }} />
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(238,241,244,.4)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
