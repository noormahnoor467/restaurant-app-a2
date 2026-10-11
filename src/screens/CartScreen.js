import React, { useState } from 'react';
import {
  Screen,
  Heading,
  Field,
  Button,
  Row,
  Notice,
  Label,
} from '../components/UI';
import EmptyState from '../components/EmptyState';
import CartItemRow from '../components/CartItemRow';
import Bill from '../components/Bill';
import { useCart } from '../context/CartContext';
export default function CartScreen({ navigation }) {
  const cart = useCart(),
    [code, setCode] = useState(''),
    [error, setError] = useState('');
  const apply = () => {
    try {
      cart.applyPromo(code);
      setError('');
      setCode('');
    } catch (e) {
      setError(e.message);
    }
  };
  if (!cart.items.length)
    return (
      <Screen>
        <Heading title="Your cart" />
        <EmptyState
          title="Your cart is empty"
          description="Choose something delicious from the menu."
          action="Browse menu"
          onPress={() => navigation.navigate('Menu')}
        />
      </Screen>
    );
  return (
    <Screen>
      <Heading
        title="Your cart"
        subtitle="Review your items and add a kitchen note."
      />
      {cart.items.map((item) => (
        <CartItemRow key={item.id} item={item} dispatch={cart.dispatch} />
      ))}
      <Field
        label="Promo code"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="CAFE10 or SAVE20"
      />
      <Label muted style={{ marginBottom: 12 }}>
        CAFE10: 10% off · SAVE20: 20% off orders over PKR 1,000.
      </Label>
      <Row style={{ marginBottom: 12 }}>
        <Button title="Apply promo" secondary onPress={apply} />
        {cart.promo ? (
          <Button
            title="Remove promo"
            secondary
            onPress={() => cart.dispatch({ type: 'REMOVE_PROMO' })}
          />
        ) : null}
      </Row>
      <Notice error message={error} />
      {cart.bill.promo ? (
        <Notice message={cart.bill.promo.code + ' applied.'} />
      ) : cart.promo ? (
        <Notice
          error
          message="Promo minimum is no longer met. No discount applied."
        />
      ) : null}
      {/* ===== TOTAL PRICE ===== */}
      <Bill bill={cart.bill} />
      <Button
        title="Checkout"
        disabled={cart.items.some((i) => !i.isAvailable)}
        onPress={() => navigation.navigate('OrderSummary')}
      />
      {cart.items.some((i) => !i.isAvailable) ? (
        <Notice error message="Remove unavailable items before checkout." />
      ) : null}
      <Button
        style={{ marginTop: 12 }}
        title="Clear cart"
        secondary
        onPress={() => {
          cart.dispatch({ type: 'CLEAR_CART' });
          setError('');
        }}
      />
    </Screen>
  );
}
