import { useStore } from './store/StoreContext.jsx';
import { SURFACE, TEXT } from './store/theme.js';
import TabBar from './components/TabBar.jsx';
import Home from './screens/Home.jsx';
import Numbers from './screens/Numbers.jsx';
import Coach from './screens/Coach.jsx';
import Session from './screens/Session.jsx';
import SummaryOverlay from './screens/SummaryOverlay.jsx';
import MemorySheet from './screens/MemorySheet.jsx';
import SettingsSheet from './screens/SettingsSheet.jsx';

export default function App() {
  const { state, dispatch } = useStore();
  const inSession = state.session === 'active';

  return (
    <div style={{
      height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column',
      background: SURFACE, color: TEXT, fontFamily: 'Chivo, system-ui, sans-serif',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ flex: 1, overflowY: inSession ? 'hidden' : 'auto', overflowX: 'hidden', minHeight: 0, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        {state.tab === 'home' && <Home />}
        {state.tab === 'lab' && <Numbers />}
        {state.tab === 'coach' && <Coach />}
      </div>

      {!inSession && <TabBar tab={state.tab} unread={state.unread} onSelect={t => dispatch({ type: 'SET_TAB', tab: t })} />}

      {inSession && <Session />}
      {state.summaryOpen && <SummaryOverlay />}
      {state.memoryOpen && <MemorySheet />}
      {state.settingsOpen && <SettingsSheet />}
    </div>
  );
}
