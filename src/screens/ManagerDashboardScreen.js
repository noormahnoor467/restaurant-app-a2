import React, { useState } from 'react';
import {
  Screen,
  Heading,
  Card,
  Label,
  Button,
  Row,
  Field,
  Notice,
} from '../components/UI';
import CategoryChip from '../components/CategoryChip';
import EmptyState from '../components/EmptyState';
import OrderCard from '../components/OrderCard';
import { AccountControls } from './ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useRestaurant } from '../context/RestaurantContext';
import { categories } from '../data/menu';
import { money } from '../constants/brand';
function MenuEditor({ item }) {
  const { updateMenu, removeMenu } = useRestaurant();
  const [price, setPrice] = useState(String(item.price)),
    [error, setError] = useState(''),
    [confirmRemove, setConfirm] = useState(false),
    [saved, setSaved] = useState('');
  const save = async () => {
    try {
       await updateMenu(item.id, { price: Number(price) });
      setError('');
      setSaved('Price saved.');
    } catch (e) {
      setError(e.message);
      setSaved('');
    }
  };
  return (
    <Card>
      <Label style={{ fontWeight: '700' }}>{item.name}</Label>
      <Label muted>
        {item.category} · {money(item.price)} ·{' '}
        {item.isAvailable ? 'Available' : 'Unavailable'}
      </Label>
      <Field
        label={`Price for ${item.name}`}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      {/* ===== MANAGER MENU PRICE CHANGE ===== */}
      <Row>
        <Button
          title="Save price"
          label={`Save price for ${item.name}`}
          small
          onPress={save}
        />
        <Button
          title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
          label={`Toggle availability for ${item.name}`}
          secondary
          small
          onPress={() =>
            updateMenu(item.id, { isAvailable: !item.isAvailable })
          }
        />
        <Button
          title="Remove item"
          label={`Delete ${item.name}`}
          secondary
          small
          onPress={() => setConfirm(true)}
        />
      </Row>
      {confirmRemove ? (
        <>
          <Label>Remove this item from the menu?</Label>
          <Row>
            <Button
              title="Confirm removal"
              danger
              small
              onPress={() => removeMenu(item.id)}
            />
            <Button
              title="Keep item"
              secondary
              small
              onPress={() => setConfirm(false)}
            />
          </Row>
        </>
      ) : null}
      <Notice error message={error} />
      <Notice message={saved} />
    </Card>
  );
}
function AddMenuForm() {
  const { addMenu } = useRestaurant();
  const initial = {
    name: '',
    description: '',
    price: '',
    category: 'Starters',
  };
  const [values, setValues] = useState(initial),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const add = async () => {
    try {
      await  addMenu(values);
      setValues(initial);
      setError('');
      setMessage('Menu item added.');
    } catch (e) {
      setError(e.message);
      setMessage('');
    }
  };
  return (
    <Card>
      <Label large>Add a menu item</Label>
      <Field
        label="New item name"
        value={values.name}
        onChangeText={(v) => set('name', v)}
      />
      <Field
        label="New item description"
        value={values.description}
        onChangeText={(v) => set('description', v)}
      />
      <Field
        label="New item price"
        value={values.price}
        onChangeText={(v) => set('price', v)}
        keyboardType="decimal-pad"
      />
      <Row>
        {categories.map((c) => (
          <CategoryChip
            key={c}
            title={c}
            selected={values.category === c}
            onPress={() => set('category', c)}
          />
        ))}
      </Row>
      <Button title="Add menu item" onPress={add} />
      <Notice error message={error} />
      <Notice message={message} />
    </Card>
  );
}
export default function ManagerDashboardScreen() {
  const { user } = useAuth(),
    { orders } = useOrders(),
    restaurant = useRestaurant(),
    [section, setSection] = useState('Orders');
  return (
    <Screen>
      <Heading
        title="Manager dashboard"
        subtitle={`Welcome, ${user.name}. Here’s what’s happening at Cafe.`}
      />
      <Card>
        <Row>
          <Label>{orders.length} total orders</Label>
          <Label>
            {
              orders.filter((o) => !['Served', 'Cancelled'].includes(o.status))
                .length
            }{' '}
            current orders
          </Label>
          <Label>
            {
              restaurant.reservations.filter((r) =>
                ['Pending', 'Accepted'].includes(r.status),
              ).length
            }{' '}
            active reservations
          </Label>
          <Label>{restaurant.menu.length} menu items</Label>
        </Row>
      </Card>
      <Row style={{ marginBottom: 18 }}>
        {['Orders', 'Reservations', 'Menu', 'Account'].map((s) => (
          <CategoryChip
            key={s}
            title={s}
            selected={section === s}
            onPress={() => setSection(s)}
          />
        ))}
      </Row>
      {section === 'Orders' ? (
        orders.length ? (
          orders.map((o) => <OrderCard key={o.id} order={o} manager />)
        ) : (
          <EmptyState
            title="No orders yet"
            description="Customer orders appear here."
          />
        )
      ) : null}
      {section === 'Reservations' ? (
        restaurant.reservations.length ? (
          restaurant.reservations.map((r) => (
            <Card key={r.id}>
              <Label style={{ fontWeight: '700' }}>
                {r.name} · {r.partySize} guests
              </Label>
              <Label>
                {r.date} at {r.time} · Table {r.tableId.replace('t', '')}
              </Label>
              <Label muted>
                {r.phone} · {r.status}
              </Label>
              {r.status === 'Pending' ? (
                <Row>
                  <Button
                    title="Accept reservation"
                    small
                    onPress={() =>
                      restaurant.decideReservation(r.id, 'Accepted')
                    }
                  />
                  <Button
                    title="Decline reservation"
                    secondary
                    small
                    onPress={() =>
                      restaurant.decideReservation(r.id, 'Declined')
                    }
                  />
                </Row>
              ) : null}
            </Card>
          ))
        ) : (
          <EmptyState
            title="No reservations yet"
            description="Customer table requests appear here."
          />
        )
      ) : null}
      {section === 'Menu' ? (
        <>
          <AddMenuForm />
          {restaurant.menu.map((m) => (
            <MenuEditor key={m.id} item={m} />
          ))}
        </>
      ) : null}
      {section === 'Account' ? (
        <>
          <Card>
            <Label>{user.name}</Label>
            <Label>{user.email}</Label>
            <Label>Manager</Label>
          </Card>
          <AccountControls />
        </>
      ) : null}
    </Screen>
  );
}
