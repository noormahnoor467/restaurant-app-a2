export const BRAND_NAME = 'Cafe';
export const CURRENCY = 'PKR';
export const money = (value) => `${CURRENCY} ${Number(value).toFixed(2)}`;
