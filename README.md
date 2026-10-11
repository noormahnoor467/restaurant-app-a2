# Cafe

Assignment 1 — Restaurant App MVP using React Native, Expo and JavaScript.

This is a frontend-only app with mock data and device-local AsyncStorage. It has no backend, API, server folder, MongoDB, JWT, bcrypt, real payments or delivery tracking.

## Install and run

Open a terminal in this folder (the inner `A1` folder containing `package.json`):

```powershell
cd C:\Users\LENOVO\Desktop\A1\A1
npm install
npx expo start
```

Press **w** for web; web dependencies are included. Scan the QR code using **Expo Go** for mobile, with your phone and computer on the same network. Use an Expo Go version compatible with **Expo SDK 57**. Windows can run web and Android tooling; an iOS simulator requires macOS. A physical iPhone can use Expo Go.

If PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npx.cmd expo start`. If a local network prevents QR access, try `npx expo start --tunnel` (Expo may request its tunnel helper).

Node.js 24 was used for implementation; Node is development tooling only, not an application backend. Dependencies are pinned by `package-lock.json`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | customer@example.com | Password123 |
| Manager | manager@example.com | Manager123 |

Choose the matching role on Login. Registration supports both roles and logs in the new account. Emails are normalized and must be unique. Passwords need at least eight characters, uppercase, lowercase and a number. These are mock credentials saved locally, in plain text for this assignment. Use sample credentials only.

## Customer features

- Five React Navigation bottom tabs: Menu, Cart, Reservation, Orders and Profile.
- Twenty menu items in Starters, Mains, Desserts and Drinks.
- Debounced search, last five searches, categories, favourites, daily specials and item details.
- Offline food symbols; unavailable items have disabled Add buttons.
- Cart badge, quantities, removal, kitchen notes and clear-cart action.
- CAFE10 gives 10% off; SAVE20 gives 20% off with a minimum subtotal of PKR 1,000.
- Itemized order summary, Dine In with a table, or Takeaway with a pickup choice.
- Order placement snapshots the bill, clears the cart and opens Orders for tracking.
- Pending → Preparing → Ready → Served at 10, 20 and 30 seconds from placement. Elapsed-time catch-up works after reload or returning to the app.
- Customer can cancel a Pending order, as shown in the UML.
- Reservations with name, phone, real date, time slot, guests and suitable table validation.
- Pending/Accepted reservations hold the selected table for that slot. Cancelled/Declined reservations release it.
- Reservation history and cancellation.
- Profile, persistent dark/light theme and logout.
- Account-specific carts, favourites, recent searches, orders and reservation views.

## Manager features

The manager goes directly to Manager Dashboard instead of the customer tabs.

- Total/current orders, active reservations and menu-item counts.
- All orders, customer names, order details and forward status updates.
- Cancellation while Pending or Preparing, following the UML.
- Reservation list with Accept and Decline actions.
- Positive menu-price edits, availability switches, new items and removal with confirmation.
- Menu edits persist and are visible to the customer after switching accounts.
- Customer cart prices synchronize with manager edits; unavailable/deleted items block checkout.
- Account details, theme switch and logout in the Account section.

## Demo assumptions

Prices use **PKR**. The SRS requires tax and service charges but does not set rates, so this demo uses **5% tax** and **2% service**, calculated after the discount with currency rounding. No payment is collected.

Reservation slots are 90 minutes apart from 12:00 to 21:00; tables support 2, 4, 6 or 8 guests. Slots in the past or with no suitable table are disabled. Each table holds one active reservation per slot. Dine In selects a table for the current visit; advance bookings use Reservation.

Automatic order progression is an assignment simulation, not a live kitchen feed. Manager changes can advance status earlier; automatic timers never regress a status or reopen a cancelled order.

All persistence is local to the device/browser origin. To demonstrate customer/manager sharing, log out and switch accounts on the **same device**. Different devices do not synchronize.

## Technologies and structure

- Expo SDK 57, React Native 0.86, React 19, JavaScript.
- React Navigation native stack and bottom tabs.
- Context API, reducers, React hooks and AsyncStorage.
- Vitest for domain logic; Playwright for browser end-to-end verification.

```text
App.js
index.js
app.json
package.json
package-lock.json
src/
  components/     Reusable fields, cards, menu/cart rows, bill, status steps, motion
  screens/        Login, Menu, Cart, OrderSummary, Orders, Reservation, Profile, ManagerDashboard
  navigation/     AppNavigator and customer tabs
  context/        Auth, Theme, Restaurant, Cart, Orders
  reducers/       cartReducer, ordersReducer, menuReducer
  hooks/          useForm, useDebounce, useReservation, useStoredReducer
  data/           users, menu, tables, reservations, promoCodes
  theme/          colors.js
  constants/      brand.js
  utils/          domain.js (validation, availability, totals, status rules)
assets/           Asset notes; no remote image dependency
tests/
  domain.test.js
  e2e/app.spec.js
UML/              Original diagrams, unchanged
SRS.pdf           Original specification, unchanged
docs/             File inventory and verification notes
```

## Contexts, reducers and hooks

| File | Responsibility |
| --- | --- |
| AuthContext | Login, signup, current user/role, favourites and logout |
| ThemeContext | Persisted mode and common color palette |
| RestaurantContext | Shared menu and reservations, manager mutations and customer bookings |
| CartContext | User cart, badge, synchronized menu prices and promo/bill |
| OrdersContext | Place order, clear cart, status transitions and timers |
| cartReducer | ADD_ITEM, INCREMENT, DECREMENT, REMOVE_ITEM, UPDATE_NOTE, APPLY_PROMO, REMOVE_PROMO, CLEAR_CART; also hydration/menu synchronization |
| ordersReducer | PLACE_ORDER, UPDATE_STATUS, TICK and hydration |
| menuReducer | Add/edit/remove menu and hydration |
| useForm | Form values, field errors, validation and reset |
| useDebounce | Delays filtering until typing pauses |
| useReservation | Reservation form, validation, capacity and availability |
| useStoredReducer | Hydration before writes, serialized AsyncStorage writes and visible retry errors |

Provider order is SafeArea → Theme → Auth → Restaurant → Cart → Orders → Navigation. Cart depends on Auth/Restaurant; Orders depends on Auth/Restaurant/Cart.

## AsyncStorage

Keys are namespaced with `cafe:`:

| Key | Saved data |
| --- | --- |
| cafe:auth | Demo/registered users, favourites and current user ID |
| cafe:theme | Light/dark selection |
| cafe:menu | Menu and manager changes |
| cafe:reservations | All local reservations |
| cafe:orders | All local order snapshots and statuses |
| cafe:cart:<userId> | Each user's items, notes and promo |
| cafe:searches:<userId> | Each user's latest five searches |

Startup waits for saved values before rendering dependent screens. Writes are serialized per key. Storage failures show a retry message instead of silently claiming a successful save. Logout resets navigation but preserves each user's saved cart and history.

## Existing UML alignment

These original files were inspected and **kept unchanged**:

- [Use Case](UML/Usecase.jpeg)
- [Class Diagram](UML/class%20diagram.jpeg)
- [Sequence Diagram](UML/sequence%20diagram.jpeg)
- [State Machine](UML/Machine%20diagram.jpeg)
- [Component Diagram](UML/component%20diagram.jpeg)

The class diagram's User/Customer/Manager are plain JavaScript user records with roles. MenuItem, CartItem, Table, Reservation and Order use the linked IDs and properties from the SRS. The component diagram's **MenuContext** is fulfilled by **RestaurantContext**, which owns the menu reducer and reservation state; it is not a second competing menu store.

The sequence is Add → ADD_ITEM → badge update → PLACE_ORDER → CLEAR_CART → Orders tracking. The OrderSummary stack screen returns to the existing CustomerTabs route. Status transitions and customer/manager cancellation follow the state-machine diagram. Original diagram names and artwork were not recreated or renamed.

## Verification

```powershell
npm test
npm run build:web
npx playwright install chromium
npm run test:e2e
npx expo install --check
npx expo-doctor
```

The end-to-end tests serve the exported `dist` directory using Python's static-file test server. This is test tooling only; the application never calls a backend. Python 3 is needed only for this test command. Browser screenshots/traces are written to `test-results`.

Compile native bundles without launching a simulator:

```powershell
npx expo export --platform android --platform ios --output-dir .tools/native-export
```

See [verification notes](docs/VERIFICATION.md) for measured results and limits.

## Important files for viva

Start with `App.js` (provider nesting), `src/navigation/AppNavigator.js` (role routing), `src/context/OrdersContext.js` (place/clear/track sequence), `src/reducers/cartReducer.js` (cart actions), `src/utils/domain.js` (totals and validation), and `src/hooks/useReservation.js` (availability).

Search for short markers such as `LOGIN BUTTON`, `SEARCH BAR`, `ADD TO CART BUTTON`, `INCREASE QUANTITY`, `TOTAL PRICE`, `PLACE ORDER BUTTON`, `RESERVATION BUTTON`, `LOGOUT BUTTON`, `MANAGER MENU PRICE CHANGE` and `DARK MODE`.

[File inventory](docs/FILES.md) lists created files and preserved originals.
