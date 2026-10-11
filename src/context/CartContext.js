import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { cartReducer, initialCart, totals } from '../reducers/cartReducer';
import { useStoredReducer } from '../hooks/useStoredReducer';
import { useAuth } from './AuthContext';
import { useRestaurant } from './RestaurantContext';
import { validatePromo } from '../data/promoCodes';
import LoadingScreen from '../components/LoadingScreen';
import { StorageNotice } from '../components/UI';
const CartContext = createContext();
function UserCartProvider({ children }) {
  const { user } = useAuth(),
    { menu } = useRestaurant();
  const store = useStoredReducer(
    'cafe:cart:' + (user?.id || 'guest'),
    cartReducer,
    initialCart,
  );
  useEffect(() => {
    if (store.ready) store.dispatch({ type: 'SYNC_MENU', payload: menu });
  }, [menu, store.ready]);
  const bill = useMemo(
    () => totals(store.state.items, store.state.promo),
    [store.state],
  );
  const addItem = (item) => {
    const current = menu.find((m) => m.id === item.id);
    if (current?.isAvailable)
      store.dispatch({ type: 'ADD_ITEM', payload: current });
  };
  const applyPromo = (code) => {
    const promo = validatePromo(code, bill.subtotal);
    store.dispatch({ type: 'APPLY_PROMO', payload: promo });
  };
  return (
    <CartContext.Provider
      value={{
        ...store.state,
        bill,
        dispatch: store.dispatch,
        addItem,
        applyPromo,
        count: store.state.items.reduce((n, i) => n + i.quantity, 0),
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
    </CartContext.Provider>
  );
}
export function CartProvider({ children }) {
  const { user } = useAuth();
  return (
    <UserCartProvider key={user?.id || 'guest'}>{children}</UserCartProvider>
  );
}
export const useCart = () => useContext(CartContext);
