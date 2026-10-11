import React, { useState } from 'react';
import { Card, Label, Row, Button, Notice } from './UI';
import OrderStatusStep from './OrderStatusStep';
import { useOrders } from '../context/OrdersContext';
import { money } from '../constants/brand';
import { ORDER_STATES } from '../utils/domain';
export default function OrderCard({
  order,
  manager = false,
  highlight = false,
}) {
  const { updateStatus } = useOrders(),
    [expanded, setExpanded] = useState(highlight),
    [error, setError] = useState('');
  const change = (status) => {
    try {
      updateStatus(order.id, status);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <Card>
      <Label style={{ fontWeight: '700' }}>Order {order.id.slice(-7)}</Label>
      {manager ? <Label>{order.customerName}</Label> : null}
      <Label muted>
        {new Date(order.timestamp).toLocaleString()} · {order.type}
      </Label>
      {order.type === 'Dine In' ? (
        <Label>Table {order.tableId.replace('t', '')}</Label>
      ) : (
        <Label>Pickup: {order.pickupTime}</Label>
      )}
      <OrderStatusStep status={order.status} />
      <Label style={{ fontWeight: '700' }}>{money(order.total)}</Label>
      <Button
        title={expanded ? 'Hide order details' : 'Show order details'}
        secondary
        small
        onPress={() => setExpanded(!expanded)}
      />
      {expanded ? (
        <>
          {order.items.map((i) => (
            <Label key={i.id}>
              {i.quantity} × {i.name} · {money(i.price * i.quantity)}
              {i.note ? ' · ' + i.note : ''}
            </Label>
          ))}
          <Label muted>
            Subtotal {money(order.subtotal)} · Discount {money(order.discount)}
            {order.promo ? ' (' + order.promo.code + ')' : ''}
          </Label>
          <Label muted>
            Tax {money(order.tax)} · Service {money(order.service)}
          </Label>
        </>
      ) : null}
      <Row>
        {manager &&
        ORDER_STATES.includes(order.status) &&
        order.status !== 'Served' ? (
          <Button
            title={`Mark ${ORDER_STATES[ORDER_STATES.indexOf(order.status) + 1]}`}
            small
            onPress={() =>
              change(ORDER_STATES[ORDER_STATES.indexOf(order.status) + 1])
            }
          />
        ) : null}
        {order.status === 'Pending' ||
        (manager && order.status === 'Preparing') ? (
          <Button
            title="Cancel order"
            secondary
            small
            onPress={() => change('Cancelled')}
          />
        ) : null}
      </Row>
      <Notice error message={error} />
    </Card>
  );
}
