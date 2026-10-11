const { test, expect } = require('@playwright/test');
async function login(page, role = 'Customer') {
  await page
    .getByLabel('Email', { exact: true })
    .fill(role === 'Customer' ? 'customer@example.com' : 'manager@example.com');
  await page
    .getByLabel('Password', { exact: true })
    .fill(role === 'Customer' ? 'Password123' : 'Manager123');
  await page.getByRole('button', { name: role, exact: true }).click();
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(
    page.getByText(role === 'Customer' ? 'The menu' : 'Manager dashboard', {
      exact: true,
    }),
  ).toBeVisible();
}
async function tab(page, name) {
  await page.getByRole('tab', { name: new RegExp(name) }).click();
}
async function logout(page, manager = false) {
  manager
    ? await page.getByRole('button', { name: 'Account', exact: true }).click()
    : await tab(page, 'Profile');
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page.getByText('Welcome back', { exact: true })).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});
test('login errors, signup validation, registered customer and manager roles', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(
    page.getByText('Enter a valid email.', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill('customer@example.com');
  await page.getByLabel('Password', { exact: true }).fill('wrong');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(
    page.getByText('Email, password or selected role is incorrect.', {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Register / Sign Up', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(
    page.getByText('Enter your full name (at least 2 characters).', {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel('Full name', { exact: true }).fill('New Customer');
  await page.getByLabel('Email', { exact: true }).fill('new@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Password123');
  await page.getByLabel('Confirm password', { exact: true }).fill('Mismatch');
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(
    page.getByText('Passwords do not match.', { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill('Password123');
  await page
    .getByRole('button', { name: 'Show passwords', exact: true })
    .click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveJSProperty(
    'type',
    'text',
  );
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page.getByText('The menu', { exact: true })).toBeVisible();
  await logout(page);
  await page.reload();
  await page.getByLabel('Email', { exact: true }).fill('new@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Password123');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByText('The menu', { exact: true })).toBeVisible();
  await logout(page);
  await page
    .getByRole('button', { name: 'Register / Sign Up', exact: true })
    .click();
  await page.getByLabel('Full name', { exact: true }).fill('New Manager');
  await page
    .getByLabel('Email', { exact: true })
    .fill('newmanager@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Manager123');
  await page.getByLabel('Confirm password', { exact: true }).fill('Manager123');
  await page.getByRole('button', { name: 'Manager', exact: true }).click();
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(
    page.getByText('Manager dashboard', { exact: true }),
  ).toBeVisible();
  await logout(page, true);
});
test('menu filters, details, favourites, cart edits, promotions, checkout and timed tracking', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await login(page);
  await page.getByRole('button', { name: 'Mains', exact: true }).click();
  await expect(
    page.getByRole('button', {
      name: 'Add Classic Burger to cart',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add Garlic Bread to cart', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByLabel('Search food', { exact: true }).fill('garlic');
  await expect(
    page.getByRole('button', { name: 'Add Garlic Bread to cart', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Favourite Garlic Bread', exact: true })
    .click();
  await page.getByRole('button', { name: 'Favourites', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Unfavourite Garlic Bread', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Details for Garlic Bread', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Close details', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Close details', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Add Garlic Bread to cart', exact: true })
    .click();
  await page.getByRole('button', { name: 'Favourites', exact: true }).click();
  await page.getByLabel('Search food', { exact: true }).fill('not-a-food');
  await expect(
    page.getByText('No results found', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Search food', { exact: true }).fill('Apple Crumble');
  await expect(
    page.getByRole('button', {
      name: 'Add Apple Crumble to cart',
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByLabel('Search food', { exact: true }).fill('');
  await tab(page, 'Cart');
  await page
    .getByRole('button', { name: 'Increase Garlic Bread', exact: true })
    .click();
  await expect(
    page.getByLabel('Quantity for Garlic Bread', { exact: true }),
  ).toHaveText('2');
  await page
    .getByRole('button', { name: 'Decrease Garlic Bread', exact: true })
    .click();
  await page
    .getByLabel('Kitchen note for Garlic Bread', { exact: true })
    .fill('Extra crisp');
  await page.getByLabel('Promo code', { exact: true }).fill('BAD');
  await page.getByRole('button', { name: 'Apply promo', exact: true }).click();
  await expect(
    page.getByText('Promo code is invalid. Try CAFE10 or SAVE20.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel('Promo code', { exact: true }).fill('CAFE10');
  await page.getByRole('button', { name: 'Apply promo', exact: true }).click();
  await expect(page.getByText('PKR 288.90', { exact: true })).toBeVisible();
  await page.reload();
  await tab(page, 'Cart');
  await expect(
    page.getByLabel('Kitchen note for Garlic Bread', { exact: true }),
  ).toHaveValue('Extra crisp');
  await expect(
    page.getByText('CAFE10 applied.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
  await page.getByRole('button', { name: 'Place order', exact: true }).click();
  await expect(
    page.getByText('Choose a table.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Takeaway', exact: true }).click();
  await page.getByRole('button', { name: '15 minutes', exact: true }).click();
  await page.getByRole('button', { name: 'Place order', exact: true }).click();
  await expect(page.getByText('Your orders', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Pickup: 15 minutes', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/1 × Garlic Bread/)).toBeVisible();
  await expect
    .poll(
      async () =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('cafe:orders'))[0].status,
        ),
      { timeout: 15000 },
    )
    .toBe('Preparing');
  await expect
    .poll(
      async () =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('cafe:orders'))[0].status,
        ),
      { timeout: 15000 },
    )
    .toBe('Ready');
  await expect
    .poll(
      async () =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('cafe:orders'))[0].status,
        ),
      { timeout: 15000 },
    )
    .toBe('Served');
  await tab(page, 'Cart');
  await expect(
    page.getByText('Your cart is empty', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await tab(page, 'Orders');
  await expect(page.getByText('● Served', { exact: true })).toBeVisible();
  await tab(page, 'Profile');
  await page.getByRole('switch', { name: 'Dark mode', exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('cafe:theme'))),
    )
    .toBe('dark');
  await page.reload();
  await tab(page, 'Profile');
  await expect(
    page.getByRole('switch', { name: 'Dark mode', exact: true }),
  ).toBeChecked();
  await page.screenshot({
    path: 'test-results/customer-dark.png',
    fullPage: true,
  });
  await logout(page);
  expect(errors).toEqual([]);
});
test('reservations validate and prevent clashes; manager accepts and declines; customer cancels', async ({
  page,
}) => {
  await login(page);
  await tab(page, 'Reservation');
  await page
    .getByRole('button', { name: 'Confirm reservation', exact: true })
    .click();
  await expect(
    page.getByText('Enter a valid phone number.', { exact: true }),
  ).toBeVisible();
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const day = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
  await page.getByLabel('Phone', { exact: true }).fill('03001234567');
  await page.getByLabel('Date (YYYY-MM-DD)', { exact: true }).fill(day);
  await page.getByRole('button', { name: '12:00', exact: true }).click();
  await page
    .getByRole('button', { name: 'Table 1 · 2 seats', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirm reservation', exact: true })
    .click();
  await expect(
    page.getByText('Reservation requested. Your manager can accept it.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: '12:00', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Table 1 · 2 seats', exact: true }),
  ).toHaveCount(0);
  await page.getByLabel('Phone', { exact: true }).fill('03001234567');
  await page
    .getByRole('button', { name: 'Table 2 · 2 seats', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirm reservation', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Cancel reservation', exact: true }),
  ).toHaveCount(2);
  await logout(page);
  await login(page, 'Manager');
  await page.getByRole('button', { name: 'Reservations', exact: true }).click();
  await page
    .getByRole('button', { name: 'Accept reservation', exact: true })
    .first()
    .click();
  await page
    .getByRole('button', { name: 'Decline reservation', exact: true })
    .click();
  await expect(page.getByText(/03001234567 · Accepted/)).toBeVisible();
  await expect(page.getByText(/03001234567 · Declined/)).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Reservations', exact: true }).click();
  await expect(page.getByText(/03001234567 · Accepted/)).toBeVisible();
  await logout(page, true);
  await login(page);
  await tab(page, 'Reservation');
  await page
    .getByRole('button', { name: 'Cancel reservation', exact: true })
    .click();
  await expect(page.getByText(/2 guests · Cancelled/)).toBeVisible();
  await page.reload();
  await tab(page, 'Reservation');
  await expect(page.getByText(/2 guests · Cancelled/)).toBeVisible();
});
test('manager edits, adds and removes menu items; changes persist to customer cart', async ({
  page,
}) => {
  await login(page);
  await page
    .getByRole('button', { name: 'Add Garlic Bread to cart', exact: true })
    .click();
  await logout(page);
  await login(page, 'Manager');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByLabel('Price for Garlic Bread', { exact: true }).fill('-1');
  await page
    .getByRole('button', { name: 'Save price for Garlic Bread', exact: true })
    .click();
  await expect(
    page.getByText('Enter a positive price.', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Price for Garlic Bread', { exact: true }).fill('425');
  await page
    .getByRole('button', { name: 'Save price for Garlic Bread', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Toggle availability for Garlic Bread',
      exact: true,
    })
    .click();
  await page.getByLabel('New item name', { exact: true }).fill('House Tea');
  await page
    .getByLabel('New item description', { exact: true })
    .fill('Fresh brewed house tea');
  await page.getByLabel('New item price', { exact: true }).fill('200');
  await page
    .getByRole('button', { name: 'Add menu item', exact: true })
    .click();
  await expect(
    page.getByText('Menu item added.', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Delete House Tea', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirm removal', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Delete House Tea', exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(
    page.getByLabel('Price for Garlic Bread', { exact: true }),
  ).toHaveValue('425');
  await logout(page, true);
  await login(page);
  await expect(
    page.getByRole('button', { name: 'Add Garlic Bread to cart', exact: true }),
  ).toBeDisabled();
  await tab(page, 'Cart');
  await expect(
    page.getByText('PKR 425.00 each · Currently unavailable', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Checkout', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('button', { name: 'Remove Garlic Bread', exact: true })
    .click();
  await expect(
    page.getByText('Your cart is empty', { exact: true }),
  ).toBeVisible();
});
test('dine-in order, customer cancellation and manager status transitions', async ({
  page,
}) => {
  await login(page);
  async function order() {
    await tab(page, 'Menu');
    await page
      .getByRole('button', { name: 'Add Garlic Bread to cart', exact: true })
      .click();
    await tab(page, 'Cart');
    await page.getByRole('button', { name: 'Checkout', exact: true }).click();
    await page
      .getByRole('button', { name: 'Table 1 · 2 seats', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Place order', exact: true })
      .click();
    await expect(page.getByText('Your orders', { exact: true })).toBeVisible();
  }
  await order();
  await page.getByRole('button', { name: 'Cancel order', exact: true }).click();
  await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
  await order();
  await logout(page);
  await login(page, 'Manager');
  const next = page.getByRole('button', {
    name: 'Mark Preparing',
    exact: true,
  });
  if (await next.count()) await next.click();
  await page.getByRole('button', { name: 'Mark Ready', exact: true }).click();
  await page.getByRole('button', { name: 'Mark Served', exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('cafe:orders'))[0].status,
      ),
    )
    .toBe('Served');
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('switch', { name: 'Dark mode', exact: true }).click();
  await expect(
    page.getByRole('switch', { name: 'Dark mode', exact: true }),
  ).toBeChecked();
  await logout(page, true);
});
test('tablet layout, cart clear and promo removal', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await login(page);
  await page
    .getByRole('button', { name: 'Add Garlic Bread to cart', exact: true })
    .click();
  await tab(page, 'Cart');
  await page.getByLabel('Promo code', { exact: true }).fill('CAFE10');
  await page.getByRole('button', { name: 'Apply promo', exact: true }).click();
  await page.getByRole('button', { name: 'Remove promo', exact: true }).click();
  await expect(page.getByText('CAFE10 applied.', { exact: true })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Clear cart', exact: true }).click();
  await expect(
    page.getByText('Your cart is empty', { exact: true }),
  ).toBeVisible();
  await tab(page, 'Menu');
  await expect
    .poll(async () =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: 'test-results/tablet-menu.png',
    fullPage: true,
  });
});
