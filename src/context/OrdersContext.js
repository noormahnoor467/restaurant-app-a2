import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useRestaurant } from './RestaurantContext';
import { useCart } from './CartContext';
import { validateCheckout, totals, canTransition } from '../utils/domain';
import { getOrders, createOrder, updateOrder } from '../api';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user } = useAuth(),
    { menu } = useRestaurant(),
    cart = useCart();
  const [orders, setOrders] = useState([]);
  const placing = useRef(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      // server not reachable, keep old list
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, 5000);
    return () => clearInterval(timer);
  }, [loadOrders]);

  useEffect(() => {
    placing.current = false;
  }, [cart.items]);

  const placeOrder = async (details) => {
    if (placing.current) throw new Error('Order is already being placed.');
    if (user?.role !== 'Customer') throw new Error('Customer access required.');
    validateCheckout(cart.items, menu, details);
    placing.current = true;
    try {
      const saved = await createOrder({
        userId: user.id,
        customerName: user.name,
        items: cart.items.map((i) => ({ ...i })),
        ...totals(cart.items, cart.promo),
        ...details,
        status: 'Pending',
        timestamp: Date.now(),
      });
      setOrders((o) => [saved, ...o]);
      cart.dispatch({ type: 'CLEAR_CART' });
      return saved;
    } catch (e) {
      placing.current = false;
      throw e;
    }
  };

  const updateStatus = async (id, status) => {
    const order = orders.find((o) => o.id === id);
    if (
      !order ||
      (user?.role !== 'Manager' && order.userId !== user?.id) ||
      !canTransition(order.status, status, user?.role)
    )
      throw new Error('This status change is not allowed.');
    const saved = await updateOrder(id, { status });
    setOrders((o) => o.map((x) => (x.id === id ? saved : x)));
  };

  return (
    <OrdersContext.Provider value={{ orders, placeOrder, updateStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);