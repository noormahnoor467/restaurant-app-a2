import React from 'react';
import { Screen, Heading } from '../components/UI';
import EmptyState from '../components/EmptyState';
import OrderCard from '../components/OrderCard';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
export default function OrdersScreen({ route }) {
  const { orders } = useOrders(),
    { user } = useAuth();
  const mine = orders.filter((o) => o.userId === user.id);
  return (
    <Screen>
      <Heading
        title="Your orders"
        subtitle="Follow your meal from the kitchen to your table."
      />
      {mine.length ? (
        mine.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            highlight={route.params?.orderId === o.id}
          />
        ))
      ) : (
        <EmptyState
          title="No orders yet"
          description="Your placed orders will appear here."
        />
      )}
    </Screen>
  );
}
