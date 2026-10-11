export const promoCodes = [
  { code: 'CAFE10', percent: 10, minimum: 0 },
  { code: 'SAVE20', percent: 20, minimum: 1000 },
];
export function validatePromo(code, subtotal) {
  const promo = promoCodes.find((p) => p.code === code.trim().toUpperCase());
  if (!promo) throw new Error('Promo code is invalid. Try CAFE10 or SAVE20.');
  if (subtotal < promo.minimum)
    throw new Error(
      `${promo.code} requires a subtotal of PKR ${promo.minimum}.`,
    );
  return promo;
}
