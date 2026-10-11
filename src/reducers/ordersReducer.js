import { automaticStatus, canTransition } from '../utils/domain';
export function ordersReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'PLACE_ORDER':
      return [action.payload, ...state];
    case 'UPDATE_STATUS':
      return state.map((o) =>
        o.id === action.id &&
        canTransition(o.status, action.status, action.role)
          ? { ...o, status: action.status }
          : o,
      );
    case 'TICK': {
      let changed = false;
      const next = state.map((o) => {
        const status = automaticStatus(o, action.now);
        if (status === o.status) return o;
        changed = true;
        return { ...o, status };
      });
      return changed ? next : state;
    }
    default:
      return state;
  }
}
