export const BASE_URL = 'http://192.168.100.12:5000';

const withId = (item) => ({ ...item, id: item._id, image: null });

export async function getMenu() {
  const res = await fetch(`${BASE_URL}/api/menu`);
  if (!res.ok) throw new Error('Failed to load menu');
  const data = await res.json();
  return data.map(withId);
}

export async function addMenuItem(values) {
  const res = await fetch(`${BASE_URL}/api/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error('Failed to add item');
  return withId(await res.json());
}

export async function updateMenuItem(id, patch) {
  const res = await fetch(`${BASE_URL}/api/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update item');
  return withId(await res.json());
}

export async function removeMenuItem(id) {
  const res = await fetch(`${BASE_URL}/api/menu/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete item');
}
export async function getOrders() {
  const res = await fetch(`${BASE_URL}/api/orders`);
  if (!res.ok) throw new Error('Failed to load orders');
  const data = await res.json();
  return data.map((o) => ({ ...o, id: o._id }));
}

export async function createOrder(order) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Failed to place order');
  const saved = await res.json();
  return { ...saved, id: saved._id };
}

export async function updateOrder(id, patch) {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update order');
  const saved = await res.json();
  return { ...saved, id: saved._id };
}
export async function getReservations() {
  const res = await fetch(`${BASE_URL}/api/reservations`);
  if (!res.ok) throw new Error('Failed to load reservations');
  const data = await res.json();
  return data.map((r) => ({ ...r, id: r._id }));
}

export async function createReservation(booking) {
  const res = await fetch(`${BASE_URL}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error('Failed to save reservation');
  const saved = await res.json();
  return { ...saved, id: saved._id };
}

export async function updateReservation(id, patch) {
  const res = await fetch(`${BASE_URL}/api/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update reservation');
  const saved = await res.json();
  return { ...saved, id: saved._id };
}
export async function loginUser({ email, password, role }) {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return { ...data, id: data._id };
}

export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return { ...data, id: data._id };
}

export async function saveFavourites(id, favourites) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favourites }),
  });
  if (!res.ok) throw new Error('Failed to save favourites');
  const data = await res.json();
  return { ...data, id: data._id };
}