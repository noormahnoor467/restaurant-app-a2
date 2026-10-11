import { useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { useForm } from './useForm';
import { availableTables, reservationErrors, localDate } from '../utils/domain';
import { TIME_SLOTS } from '../data/tables';
export function useReservation() {
  const { user } = useAuth(),
    restaurant = useRestaurant();
  const initial = {
    name: user?.name || '',
    phone: '',
    date: localDate(),
    time: '',
    guests: '2',
    tableId: '',
  };
  const form = useForm(initial, (v) =>
    reservationErrors(v, restaurant.reservations),
  );
  const available = useMemo(
    () =>
      availableTables(
        restaurant.reservations,
        form.values.date,
        form.values.time,
        form.values.guests,
      ),
    [
      restaurant.reservations,
      form.values.date,
      form.values.time,
      form.values.guests,
    ],
  );
  const slots = TIME_SLOTS.map((time) => ({
    time,
    available:
      availableTables(
        restaurant.reservations,
        form.values.date,
        time,
        form.values.guests,
      ).length > 0,
  }));
  const setValue = (key, value) => {
    form.setValue(key, value);
    if (['date', 'time', 'guests'].includes(key)) form.setValue('tableId', '');
  };
  const confirm = async () => {
    if (!form.validate()) return false;
   await  restaurant.reserve(form.values);
    form.reset({ ...initial, date: form.values.date });
    return true;
  };
  return {
    ...form,
    setValue,
    available,
    slots,
    confirm,
    reservations: restaurant.reservations.filter((r) => r.userId === user?.id),
    cancel: restaurant.cancelReservation,
  };
}
