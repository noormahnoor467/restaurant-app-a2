import React, { useState } from 'react';
import {
  Screen,
  Heading,
  Card,
  Label,
  Button,
  Row,
  Notice,
} from '../components/UI';
import CategoryChip from '../components/CategoryChip';
import Bill from '../components/Bill';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { tables } from '../data/tables';
import { money } from '../constants/brand';
import EmptyState from '../components/EmptyState';
export default function OrderSummaryScreen({ navigation }) {
  const cart = useCart(),
    { placeOrder } = useOrders();
  const [type, setType] = useState('Dine In'),
    [tableId, setTable] = useState(''),
    [pickupTime, setPickup] = useState('ASAP'),
    [error, setError] = useState(''),
    [placing, setPlacing] = useState(false);
  const submit = async () => {
    try {
      setPlacing(true);
      const order = placeOrder({
        type,
        tableId: type === 'Dine In' ? tableId : null,
        pickupTime: type === 'Takeaway' ? pickupTime : null,
      });
      navigation.popTo('CustomerTabs', {
        screen: 'Orders',
        params: { orderId: order.id },
      });
    } catch (e) {
      setError(e.message);
      setPlacing(false);
    }
  };
  if (!cart.items.length)
    return (
      <Screen>
        <EmptyState
          title="Your cart is empty"
          description="Add menu items before placing an order."
        />
      </Screen>
    );
  return (
    <Screen>
      <Heading
        title="Order summary"
        subtitle="Confirm your meal and how you’ll enjoy it."
      />
      <Card>
        {cart.items.map((i) => (
          <Label key={i.id}>
            {i.quantity} × {i.name} · {money(i.price * i.quantity)}
            {i.note ? ' · ' + i.note : ''}
          </Label>
        ))}
      </Card>
      <Row style={{ marginBottom: 16 }}>
        {['Dine In', 'Takeaway'].map((t) => (
          <CategoryChip
            key={t}
            title={t}
            selected={type === t}
            onPress={() => setType(t)}
          />
        ))}
      </Row>
      <Card>
        {type === 'Dine In' ? (
          <>
            <Label>Select your table</Label>
            <Label muted>
              For your current visit. Advance bookings use the Reservation tab.
            </Label>
            <Row>
              {tables
                .filter((t) => t.isAvailable)
                .map((t) => (
                  <CategoryChip
                    key={t.id}
                    title={`Table ${t.number} · ${t.seats} seats`}
                    selected={tableId === t.id}
                    onPress={() => setTable(t.id)}
                  />
                ))}
            </Row>
          </>
        ) : (
          <>
            <Label>Pickup time</Label>
            <Row>
              {['ASAP', '15 minutes', '30 minutes', '45 minutes'].map((t) => (
                <CategoryChip
                  key={t}
                  title={t}
                  selected={pickupTime === t}
                  onPress={() => setPickup(t)}
                />
              ))}
            </Row>
          </>
        )}
      </Card>
      <Bill bill={cart.bill} />
      <Notice error message={error} />
      {/* ===== PLACE ORDER BUTTON ===== */}
      <Button title="Place order" disabled={placing} onPress={submit} />
    </Screen>
  );
}
