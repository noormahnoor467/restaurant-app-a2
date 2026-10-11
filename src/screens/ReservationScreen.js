import React, { useState } from 'react';
import {
  Screen,
  Heading,
  Card,
  Field,
  Label,
  Row,
  Button,
  Notice,
} from '../components/UI';
import CategoryChip from '../components/CategoryChip';
import EmptyState from '../components/EmptyState';
import { useReservation } from '../hooks/useReservation';
export default function ReservationScreen() {
  const r = useReservation(),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  const field = (label, key, props = {}) => (
    <Field
      label={label}
      value={r.values[key]}
      onChangeText={(v) => r.setValue(key, v)}
      error={r.errors[key]}
      {...props}
    />
  );
  const confirm = async () => {
    setMessage('');
    setError('');
    try {
      if (await r.confirm())
        setMessage('Reservation requested. Your manager can accept it.');
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <Screen>
      <Heading title="Reserve a table" subtitle="Make room for a good time." />
      <Card>
        {field('Customer name', 'name')}
        {field('Phone', 'phone', { keyboardType: 'phone-pad' })}
        {field('Date (YYYY-MM-DD)', 'date', {
          placeholder: 'YYYY-MM-DD',
          maxLength: 10,
        })}
        {field('Number of guests', 'guests', {
          keyboardType: 'number-pad',
          maxLength: 2,
        })}
        <Label>Time slot</Label>
        <Row>
          {r.slots.map((s) => (
            <CategoryChip
              key={s.time}
              title={s.time}
              selected={r.values.time === s.time}
              disabled={!s.available}
              onPress={() => r.setValue('time', s.time)}
            />
          ))}
        </Row>
        <Notice error message={r.errors.time} />
        <Label muted>
          Disabled slots have passed or have no suitable table.
        </Label>
        <Label>Available tables</Label>
        <Row>
          {r.available.map((t) => (
            <CategoryChip
              key={t.id}
              title={`Table ${t.number} · ${t.seats} seats`}
              selected={r.values.tableId === t.id}
              onPress={() => r.setValue('tableId', t.id)}
            />
          ))}
        </Row>
        {!r.available.length ? (
          <Label muted>
            Choose a future date, time and group size to see tables.
          </Label>
        ) : null}
        <Notice error message={r.errors.tableId} />
        {/* ===== RESERVATION BUTTON ===== */}
        <Button title="Confirm reservation" onPress={confirm} />
        <Notice error message={error} />
        <Notice message={message} />
      </Card>
      <Heading title="Your reservations" />
      {r.reservations.length ? (
        r.reservations.map((b) => (
          <Card key={b.id}>
            <Label style={{ fontWeight: '700' }}>
              {b.date} at {b.time} · Table {b.tableId.replace('t', '')}
            </Label>
            <Label>
              {b.name} · {b.partySize} guests · {b.status}
            </Label>
            <Label muted>{b.phone}</Label>
            {['Pending', 'Accepted'].includes(b.status) ? (
              <Button
                title="Cancel reservation"
                secondary
                onPress={() => r.cancel(b.id)}
              />
            ) : null}
          </Card>
        ))
      ) : (
        <EmptyState
          title="No reservations yet"
          description="Your table bookings will appear here."
        />
      )}
    </Screen>
  );
}
