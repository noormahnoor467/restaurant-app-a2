export function menuReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD_MENU_ITEM':
      return [...state, action.payload];
    case 'UPDATE_MENU_ITEM':
      return state.map((m) =>
        m.id === action.id ? { ...m, ...action.patch } : m,
      );
    case 'REMOVE_MENU_ITEM':
      return state.filter((m) => m.id !== action.id);
    default:
      return state;
  }
}
