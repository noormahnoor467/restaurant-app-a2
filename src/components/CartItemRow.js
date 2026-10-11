import React from 'react';
import { Card, Label, Row, Button, Field, styles } from './UI';
import { money } from '../constants/brand';
export default function CartItemRow({ item, dispatch }) {
  return (
    <Card>
      <Row style={styles.between}>
        <Label style={styles.bold}>{item.name}</Label>
        <Label>{money(item.price * item.quantity)}</Label>
      </Row>
      <Label muted>
        {money(item.price)} each
        {!item.isAvailable ? ' · Currently unavailable' : ''}
      </Label>
      <Row>
        <Button
          title="−"
          label={`Decrease ${item.name}`}
          secondary
          small
          onPress={() => dispatch({ type: 'DECREMENT', id: item.id })}
        />
        <Label accessibilityLabel={`Quantity for ${item.name}`}>
          {item.quantity}
        </Label>
        {/* ===== INCREASE QUANTITY ===== */}
        <Button
          title="+"
          label={`Increase ${item.name}`}
          secondary
          small
          disabled={!item.isAvailable}
          onPress={() => dispatch({ type: 'INCREMENT', id: item.id })}
        />
        <Button
          title="Remove"
          label={`Remove ${item.name}`}
          secondary
          small
          onPress={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
        />
      </Row>
      <Field
        label={`Kitchen note for ${item.name}`}
        value={item.note}
        maxLength={200}
        placeholder="e.g. No onions"
        onChangeText={(note) =>
          dispatch({ type: 'UPDATE_NOTE', id: item.id, note })
        }
      />
    </Card>
  );
}
