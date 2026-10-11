import { totals } from '../utils/domain';
export const initialCart = { items: [], promo: null };
export function cartReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD_ITEM': {
      if (!action.payload.isAvailable) return state;
      const found = state.items.find((i) => i.id === action.payload.id);
      return {
        ...state,
        items: found
          ? state.items.map((i) =>
              i.id === found.id ? { ...i, quantity: i.quantity + 1 } : i,
            )
          : [...state.items, { ...action.payload, quantity: 1, note: '' }],
      };
    }
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      };
    case 'DECREMENT':
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, note: action.note } : i,
        ),
      };
    case 'APPLY_PROMO':
      return { ...state, promo: action.payload };
    case 'REMOVE_PROMO':
      return { ...state, promo: null };
    case 'CLEAR_CART':
      return initialCart;
    case 'SYNC_MENU':
      return {
        ...state,
        items: state.items.map((i) => {
          const m = action.payload.find((m) => m.id === i.id);
          return m
            ? { ...i, price: m.price, isAvailable: m.isAvailable }
            : { ...i, isAvailable: false };
        }),
      };
    default:
      return state;
  }
}
export { totals };
