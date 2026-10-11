import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { categories } from '../data/menu';
import { useAuth } from './AuthContext';
import { reservationErrors } from '../utils/domain';
import LoadingScreen from '../components/LoadingScreen';
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  removeMenuItem,
  getReservations,
  createReservation,
  updateReservation,
} from '../api';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [menuReady, setMenuReady] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [reservations, setReservations] = useState([]);

  const loadMenu = useCallback(async () => {
    try {
      const data = await getMenu();
      setMenu(data);
      setMenuError('');
    } catch (e) {
      setMenuError(
        'Cannot reach server. Check Wi-Fi and the IP address in api.js.',
      );
    } finally {
      setMenuReady(true);
    }
  }, []);

  const loadReservations = useCallback(async () => {
    try {
      setReservations(await getReservations());
    } catch (e) {
      // server not reachable, keep old list
    }
  }, []);

  useEffect(() => {
    loadMenu();
    loadReservations();
    const t1 = setInterval(loadMenu, 10000);
    const t2 = setInterval(loadReservations, 5000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [loadMenu, loadReservations]);

  const manager = () => {
    if (user?.role !== 'Manager') throw new Error('Manager access required.');
  };

  const updateMenu = async (id, patch) => {
    manager();
    if (
      patch.price !== undefined &&
      (!Number.isFinite(patch.price) || patch.price <= 0)
    )
      throw new Error('Enter a positive price.');
    const saved = await updateMenuItem(id, patch);
    setMenu((m) => m.map((i) => (i.id === id ? saved : i)));
  };

  const addMenu = async (values) => {
    manager();
    if (
      values.name.trim().length < 2 ||
      !values.description.trim() ||
      !categories.includes(values.category) ||
      !Number.isFinite(Number(values.price)) ||
      Number(values.price) <= 0
    )
      throw new Error(
        'Enter a name, description, category and positive price.',
      );
    const saved = await addMenuItem({
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      category: values.category,
      isAvailable: true,
      isSpecial: false,
      emoji: '🍽️',
    });
    setMenu((m) => [...m, saved]);
  };

  const removeMenu = async (id) => {
    manager();
    await removeMenuItem(id);
    setMenu((m) => m.filter((i) => i.id !== id));
  };

  const reserve = async (values) => {
    if (user?.role !== 'Customer') throw new Error('Customer access required.');
    const errors = reservationErrors(values, reservations);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const saved = await createReservation({
      ...values,
      userId: user.id,
      partySize: Number(values.guests),
      status: 'Pending',
    });
    setReservations((s) => [saved, ...s]);
    return saved;
  };

  const cancelReservation = async (id) => {
    const r = reservations.find((x) => x.id === id);
    if (
      !r ||
      r.userId !== user?.id ||
      !['Pending', 'Accepted'].includes(r.status)
    )
      return;
    const saved = await updateReservation(id, { status: 'Cancelled' });
    setReservations((s) => s.map((x) => (x.id === id ? saved : x)));
  };

  const decideReservation = async (id, status) => {
    manager();
    if (!['Accepted', 'Declined'].includes(status))
      throw new Error('Invalid reservation status.');
    const r = reservations.find((x) => x.id === id);
    if (!r || r.status !== 'Pending') return;
    const saved = await updateReservation(id, { status });
    setReservations((s) => s.map((x) => (x.id === id ? saved : x)));
  };

  return (
    <RestaurantContext.Provider
      value={{
        menu,
        menuError,
        reloadMenu: loadMenu,
        reservations,
        updateMenu,
        addMenu,
        removeMenu,
        reserve,
        cancelReservation,
        decideReservation,
      }}
    >
      {menuReady ? children : <LoadingScreen />}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);