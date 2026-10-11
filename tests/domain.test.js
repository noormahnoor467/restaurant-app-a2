import { describe, it, expect } from 'vitest';
import { cartReducer, initialCart } from '../src/reducers/cartReducer';
import { ordersReducer } from '../src/reducers/ordersReducer';
import { menuReducer } from '../src/reducers/menuReducer';
import { menu, categories } from '../src/data/menu';
import { validatePromo } from '../src/data/promoCodes';
import {
  authErrors,
  totals,
  availableTables,
  reservationErrors,
  automaticStatus,
  canTransition,
  validateCheckout,
  validDate,
} from '../src/utils/domain';
const item = menu[0];
describe('mock data', () => {
  it('has 20 unique menu items and four populated categories', () => {
    expect(menu).toHaveLength(20);
    expect(new Set(menu.map((m) => m.id)).size).toBe(20);
    for (const c of categories)
      expect(
        menu.filter((m) => m.category === c).length,
      ).toBeGreaterThanOrEqual(5);
  });
});
describe('authentication validation', () => {
  const valid = {
    name: 'Test Customer',
    email: 'test@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    role: 'Customer',
  };
  it('accepts valid signup for both roles', () => {
    expect(authErrors(valid, true)).toEqual({});
    expect(authErrors({ ...valid, role: 'Manager' }, true)).toEqual({});
  });
  it.each(['bad', 'a@', 'a@b', 'a b@c.com'])(
    'rejects invalid email %s',
    (email) => expect(authErrors({ ...valid, email }, true).email).toBeTruthy(),
  );
  it.each(['short', 'password123', 'PASSWORD123', 'PasswordOnly'])(
    'rejects weak signup password %s',
    (password) =>
      expect(authErrors({ ...valid, password }, true).password).toBeTruthy(),
  );
  it('checks name, confirmation and role', () => {
    const e = authErrors(
      { ...valid, name: '', confirmPassword: 'different', role: 'Other' },
      true,
    );
    expect(e.name).toBeTruthy();
    expect(e.confirmPassword).toBeTruthy();
    expect(e.role).toBeTruthy();
  });
});
describe('cart and promos', () => {
  it('merges repeated additions and blocks unavailable items', () => {
    const s = cartReducer(
      cartReducer(initialCart, { type: 'ADD_ITEM', payload: item }),
      { type: 'ADD_ITEM', payload: item },
    );
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(2);
    expect(
      cartReducer(s, {
        type: 'ADD_ITEM',
        payload: { ...item, isAvailable: false },
      }),
    ).toBe(s);
  });
  it('increments, decrements, stores notes and removes at zero', () => {
    let s = cartReducer(initialCart, { type: 'ADD_ITEM', payload: item });
    s = cartReducer(s, { type: 'INCREMENT', id: item.id });
    s = cartReducer(s, { type: 'UPDATE_NOTE', id: item.id, note: 'No garlic' });
    expect(s.items[0]).toMatchObject({ quantity: 2, note: 'No garlic' });
    s = cartReducer(s, { type: 'DECREMENT', id: item.id });
    s = cartReducer(s, { type: 'DECREMENT', id: item.id });
    expect(s.items).toEqual([]);
  });
  it('removes an item and clears the full cart', () => {
    let s = cartReducer(initialCart, { type: 'ADD_ITEM', payload: item });
    s = cartReducer(s, {
      type: 'APPLY_PROMO',
      payload: validatePromo('cafe10', 300),
    });
    expect(s.promo.code).toBe('CAFE10');
    expect(cartReducer(s, { type: 'REMOVE_PROMO' }).promo).toBeNull();
    expect(cartReducer(s, { type: 'REMOVE_ITEM', id: item.id }).items).toEqual(
      [],
    );
    expect(cartReducer(s, { type: 'CLEAR_CART' })).toEqual(initialCart);
  });
  it('calculates discount then tax and service with currency rounding', () => {
    expect(
      totals([{ price: 300, quantity: 2 }], validatePromo('CAFE10', 600)),
    ).toMatchObject({
      subtotal: 600,
      discount: 60,
      tax: 27,
      service: 10.8,
      total: 577.8,
    });
  });
  it('validates promo codes and recalculates minimum after quantity changes', () => {
    expect(() => validatePromo('NOPE', 1000)).toThrow();
    expect(() => validatePromo('SAVE20', 999)).toThrow();
    const p = validatePromo(' save20 ', 1000);
    expect(totals([{ price: 300, quantity: 1 }], p).discount).toBe(0);
    expect(totals([{ price: 1000, quantity: 1 }], p).total).toBe(856);
  });
  it('syncs changed prices and deleted menu availability', () => {
    const s = { items: [{ ...item, quantity: 1, note: 'Test' }], promo: null };
    expect(
      cartReducer(s, { type: 'SYNC_MENU', payload: [{ ...item, price: 500 }] })
        .items[0],
    ).toMatchObject({ price: 500, note: 'Test' });
    expect(
      cartReducer(s, { type: 'SYNC_MENU', payload: [] }).items[0].isAvailable,
    ).toBe(false);
  });
});
describe('orders follow UML state machine', () => {
  it.each([
    [0, 'Pending'],
    [10000, 'Preparing'],
    [20000, 'Ready'],
    [30000, 'Served'],
  ])('advances at %i ms to %s', (elapsed, status) =>
    expect(
      automaticStatus({ timestamp: 1000, status: 'Pending' }, 1000 + elapsed),
    ).toBe(status),
  );
  it('never regresses a manager status or reopens cancellation', () => {
    expect(automaticStatus({ timestamp: 1000, status: 'Ready' }, 2000)).toBe(
      'Ready',
    );
    expect(
      automaticStatus({ timestamp: 1000, status: 'Cancelled' }, 50000),
    ).toBe('Cancelled');
  });
  it('allows cancellation only at UML states', () => {
    expect(canTransition('Pending', 'Cancelled', 'Customer')).toBe(true);
    expect(canTransition('Preparing', 'Cancelled', 'Customer')).toBe(false);
    expect(canTransition('Preparing', 'Cancelled', 'Manager')).toBe(true);
    expect(canTransition('Ready', 'Cancelled', 'Manager')).toBe(false);
    expect(canTransition('Pending', 'Served', 'Manager')).toBe(false);
  });
  it('places immutable snapshots and ticks all orders', () => {
    const o = { id: 'one', items: [item], timestamp: 1000, status: 'Pending' };
    const s = ordersReducer([], { type: 'PLACE_ORDER', payload: o });
    expect(s).toEqual([o]);
    expect(ordersReducer(s, { type: 'TICK', now: 21000 })[0].status).toBe(
      'Ready',
    );
    expect(o.status).toBe('Pending');
    expect(
      ordersReducer(s, {
        type: 'UPDATE_STATUS',
        id: 'one',
        status: 'Served',
        role: 'Manager',
      })[0].status,
    ).toBe('Pending');
  });
  it('checks checkout against current menu and order options', () => {
    const items = [{ ...item, quantity: 1 }];
    expect(() =>
      validateCheckout(items, menu, { type: 'Dine In', tableId: 't1' }),
    ).not.toThrow();
    expect(() =>
      validateCheckout(items, menu, { type: 'Takeaway', pickupTime: 'ASAP' }),
    ).not.toThrow();
    expect(() =>
      validateCheckout([], menu, { type: 'Takeaway', pickupTime: 'ASAP' }),
    ).toThrow();
    expect(() =>
      validateCheckout(items, [], { type: 'Takeaway', pickupTime: 'ASAP' }),
    ).toThrow(/unavailable/);
    expect(() =>
      validateCheckout(items, [{ ...item, price: 301 }], {
        type: 'Takeaway',
        pickupTime: 'ASAP',
      }),
    ).toThrow(/prices changed/);
    expect(() =>
      validateCheckout(items, menu, { type: 'Dine In', tableId: '' }),
    ).toThrow(/table/);
  });
});
describe('reservations', () => {
  const now = new Date('2030-01-01T10:00:00').getTime();
  const valid = {
    name: 'Test User',
    phone: '03001234567',
    date: '2030-01-02',
    time: '12:00',
    guests: '2',
    tableId: 't1',
  };
  it('validates real dates and rejects past dates and invalid fields', () => {
    expect(validDate('2030-02-30')).toBe(false);
    expect(reservationErrors(valid, [], now)).toEqual({});
    const e = reservationErrors(
      {
        ...valid,
        name: '',
        phone: 'abc',
        date: '2029-01-01',
        time: 'bad',
        guests: '0',
        tableId: '',
      },
      [],
      now,
    );
    expect(Object.keys(e)).toHaveLength(6);
  });
  it('respects capacity, slot conflicts and pending holds', () => {
    const bookings = [{ ...valid, status: 'Pending' }];
    expect(
      availableTables(bookings, valid.date, valid.time, 2, now).some(
        (t) => t.id === 't1',
      ),
    ).toBe(false);
    expect(
      availableTables(bookings, valid.date, '13:30', 2, now).some(
        (t) => t.id === 't1',
      ),
    ).toBe(true);
    expect(
      availableTables([], valid.date, valid.time, 8, now).map((t) => t.id),
    ).toEqual(['t6']);
  });
  it.each(['Cancelled', 'Declined'])('releases a %s reservation', (status) =>
    expect(
      availableTables(
        [{ ...valid, status }],
        valid.date,
        valid.time,
        2,
        now,
      ).some((t) => t.id === 't1'),
    ).toBe(true),
  );
  it('rejects a slot before the current time', () =>
    expect(
      availableTables(
        [],
        '2030-01-01',
        '12:00',
        2,
        new Date('2030-01-01T13:00:00').getTime(),
      ),
    ).toEqual([]));
  it('rejects a double booking on confirmation', () =>
    expect(
      reservationErrors(valid, [{ ...valid, status: 'Accepted' }], now).tableId,
    ).toBeTruthy());
});
describe('manager menu reducer', () => {
  it('adds, edits price and availability, and removes locally', () => {
    let s = menuReducer(menu, {
      type: 'ADD_MENU_ITEM',
      payload: { ...item, id: 'new' },
    });
    expect(s).toHaveLength(21);
    s = menuReducer(s, {
      type: 'UPDATE_MENU_ITEM',
      id: 'new',
      patch: { price: 700, isAvailable: false },
    });
    expect(s.find((m) => m.id === 'new')).toMatchObject({
      price: 700,
      isAvailable: false,
    });
    expect(
      menuReducer(s, { type: 'REMOVE_MENU_ITEM', id: 'new' }),
    ).toHaveLength(20);
  });
});
