import { tables, TIME_SLOTS } from '../data/tables';
export const newId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export const round = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
export function totals(items, promo) {
  const subtotal = round(
    items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  );
  const active = promo && subtotal >= promo.minimum ? promo : null;
  const discount = round((subtotal * (active?.percent || 0)) / 100);
  const taxable = round(subtotal - discount);
  const tax = round(taxable * 0.05),
    service = round(taxable * 0.02);
  return {
    subtotal,
    discount,
    tax,
    service,
    total: round(taxable + tax + service),
    promo: active,
  };
}
export function authErrors(values, signup) {
  const errors = {};
  if (signup && values.name.trim().length < 2)
    errors.name = 'Enter your full name (at least 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Enter a valid email.';
  if (!values.password) errors.password = 'Enter your password.';
  else if (
    signup &&
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(values.password)
  )
    errors.password =
      'Use 8+ characters with uppercase, lowercase and a number.';
  if (signup && values.password !== values.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';
  if (!['Customer', 'Manager'].includes(values.role))
    errors.role = 'Choose a role.';
  return errors;
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + 'T12:00:00');
  return !Number.isNaN(parsed.getTime()) && localDate(parsed) === date;
}
export function availableTables(
  reservations,
  date,
  time,
  guests,
  now = Date.now(),
) {
  if (
    !validDate(date) ||
    !TIME_SLOTS.includes(time) ||
    !Number.isInteger(Number(guests)) ||
    Number(guests) < 1 ||
    new Date(date + 'T' + time + ':00').getTime() <= now
  )
    return [];
  return tables.filter(
    (t) =>
      t.isAvailable &&
      t.seats >= Number(guests) &&
      !reservations.some(
        (r) =>
          r.tableId === t.id &&
          r.date === date &&
          r.time === time &&
          ['Pending', 'Accepted'].includes(r.status),
      ),
  );
}
export function reservationErrors(values, reservations, now = Date.now()) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name.';
  if (
    !/^\+?[\d\s()-]{7,20}$/.test(values.phone.trim()) ||
    values.phone.replace(/\D/g, '').length < 7
  )
    errors.phone = 'Enter a valid phone number.';
  if (!validDate(values.date))
    errors.date = 'Use a real date in YYYY-MM-DD format.';
  else if (values.date < localDate(new Date(now)))
    errors.date = 'Choose today or a future date.';
  if (!TIME_SLOTS.includes(values.time)) errors.time = 'Choose a time slot.';
  else if (
    validDate(values.date) &&
    new Date(values.date + 'T' + values.time + ':00').getTime() <= now
  )
    errors.time = 'Choose a future time.';
  if (
    !Number.isInteger(Number(values.guests)) ||
    Number(values.guests) < 1 ||
    Number(values.guests) > 8
  )
    errors.guests = 'Choose 1 to 8 guests.';
  if (
    !availableTables(
      reservations,
      values.date,
      values.time,
      values.guests,
      now,
    ).some((t) => t.id === values.tableId)
  )
    errors.tableId = 'Select an available table for your group.';
  return errors;
}
export const ORDER_STATES = ['Pending', 'Preparing', 'Ready', 'Served'];
export function canTransition(from, to, role) {
  if (to === 'Cancelled')
    return role === 'Customer'
      ? from === 'Pending'
      : role === 'Manager' && ['Pending', 'Preparing'].includes(from);
  return (
    role === 'Manager' &&
    ORDER_STATES.indexOf(to) === ORDER_STATES.indexOf(from) + 1 &&
    ORDER_STATES.includes(from)
  );
}
export function automaticStatus(order, now = Date.now()) {
  if (order.status === 'Cancelled' || order.status === 'Served')
    return order.status;
  const elapsed = now - order.timestamp;
  const target =
    elapsed >= 30000
      ? 'Served'
      : elapsed >= 20000
        ? 'Ready'
        : elapsed >= 10000
          ? 'Preparing'
          : 'Pending';
  return ORDER_STATES[
    Math.max(ORDER_STATES.indexOf(order.status), ORDER_STATES.indexOf(target))
  ];
}
export function validateCheckout(items, menu, details) {
  if (!items.length) throw new Error('Your cart is empty.');
  for (const item of items) {
    const current = menu.find((m) => m.id === item.id);
    if (!current?.isAvailable)
      throw new Error(`${item.name} is unavailable. Remove it from your cart.`);
    if (current.price !== item.price)
      throw new Error(
        'Menu prices changed. Return to your cart to review the updated total.',
      );
  }
  if (!['Dine In', 'Takeaway'].includes(details.type))
    throw new Error('Choose an order type.');
  if (
    details.type === 'Dine In' &&
    !tables.some((t) => t.id === details.tableId && t.isAvailable)
  )
    throw new Error('Choose a table.');
  if (
    details.type === 'Takeaway' &&
    !['ASAP', '15 minutes', '30 minutes', '45 minutes'].includes(
      details.pickupTime,
    )
  )
    throw new Error('Choose a pickup time.');
}
