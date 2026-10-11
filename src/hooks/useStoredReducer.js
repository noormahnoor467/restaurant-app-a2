import { useEffect, useReducer, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const writes = new Map();
const replaceReducer = (state, action) =>
  action.type === 'HYDRATE'
    ? action.payload
    : typeof action.payload === 'function'
      ? action.payload(state)
      : action.payload;
// Hydrate before writing so startup never overwrites a saved value.
export function useStoredReducer(key, reducer, initial) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [ready, setReady] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await writes.get(key);
        const raw = await AsyncStorage.getItem(key);
        if (raw && active)
          dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
      } catch {
        if (active)
          setError(
            'Could not read saved data. Changes will not be saved until you retry.',
          );
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [key]);
  useEffect(() => {
    if (!ready || error) return;
    const pending = (writes.get(key) || Promise.resolve())
      .catch(() => {})
      .then(() => AsyncStorage.setItem(key, JSON.stringify(state)));
    writes.set(key, pending);
    pending.catch(() =>
      setError('Could not save local changes. Please retry.'),
    );
  }, [key, state, ready, error]);
  const retry = useCallback(async () => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(state));
      setError('');
    } catch {
      setError('Local storage is still unavailable.');
    }
  }, [key, state]);
  return { state, dispatch, ready, error, retry };
}
export function useStoredState(key, initial) {
  const stored = useStoredReducer(key, replaceReducer, initial);
  const setState = useCallback(
    (payload) => stored.dispatch({ type: 'SET', payload }),
    [stored.dispatch],
  );
  return { ...stored, setState };
}
