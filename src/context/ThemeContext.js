import React, { createContext, useContext } from 'react';
import { useStoredState } from '../hooks/useStoredReducer';
import { colors } from '../theme/colors';
import LoadingScreen from '../components/LoadingScreen';
import { StorageNotice } from '../components/UI';
const ThemeContext = createContext();
export function ThemeProvider({ children }) {
  const store = useStoredState('cafe:theme', 'light');
  const mode = store.state === 'dark' ? 'dark' : 'light';
  return (
    <ThemeContext.Provider
      value={{
        mode,
        colors: colors[mode],
        toggleTheme: () => store.setState(mode === 'dark' ? 'light' : 'dark'),
      }}
    >
      {store.ready ? (
        <>
          {children}
          <StorageNotice store={store} />
        </>
      ) : (
        <LoadingScreen />
      )}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
