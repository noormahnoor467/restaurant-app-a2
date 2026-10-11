import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authErrors } from '../utils/domain';
import LoadingScreen from '../components/LoadingScreen';
import { loginUser, registerUser, saveFavourites } from '../api';

const AuthContext = createContext();
const KEY = 'cafe:session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved) setUser(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
      setReady(true);
    })();
  }, []);

  const remember = async (account) => {
    setUser(account);
    try {
      if (account) await AsyncStorage.setItem(KEY, JSON.stringify(account));
      else await AsyncStorage.removeItem(KEY);
    } catch (e) {
      // ignore
    }
  };

  const login = async (values) => {
    if (Object.keys(authErrors(values, false)).length)
      throw new Error('Check your email and password.');
    const account = await loginUser({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      role: values.role,
    });
    await remember(account);
  };

  const signup = async (values) => {
    if (Object.keys(authErrors(values, true)).length)
      throw new Error('Check the registration fields.');
    const account = await registerUser({
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      role: values.role,
    });
    await remember(account);
  };

  const logout = () => remember(null);

  const toggleFavourite = async (id) => {
    if (!user) return;
    const favourites = user.favourites.includes(id)
      ? user.favourites.filter((f) => f !== id)
      : [...user.favourites, id];
    const updated = { ...user, favourites };
    await remember(updated);
    try {
      await saveFavourites(user.id, favourites);
    } catch (e) {
      // keep local change if server is unreachable
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role: user?.role, login, signup, logout, toggleFavourite }}
    >
      {ready ? children : <LoadingScreen />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);