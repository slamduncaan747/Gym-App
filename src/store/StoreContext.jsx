import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { reducer } from './reducer.js';
import { loadRaw, save } from './persist.js';
import { freshState } from './initialState.js';
import { todayISO } from '../lib/format.js';

const StoreCtx = createContext(null);

function init() {
  const todayIso = todayISO();
  const saved = loadRaw();
  return saved || freshState(todayIso);
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const saveTimer = useRef(null);

  // Persist to localStorage, debounced so the once-a-second session timer
  // doesn't hammer storage.
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(state), 250);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  // Session clock / rest countdown.
  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(t);
  }, []);

  // Drop expired temporary memories once per load.
  useEffect(() => {
    dispatch({ type: 'EXPIRE_MEMORIES', todayIso: todayISO() });
  }, []);

  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
