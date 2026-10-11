# Cafe verification

Verified on 6 October 2026 using Windows, Node 24.21.0 and Chromium.

## Results

| Check | Result |
| --- | --- |
| `npm test` | 32 tests passed |
| `npm run build:web` | Export succeeded; all screen/context imports bundled |
| `npm run test:e2e` | 6 complete browser scenarios passed, approximately 1.1 minutes |
| `npx expo install --check` | Dependencies up to date |
| `npx expo-doctor` | 21/21 checks passed |
| Android export | Hermes bundle succeeded |
| iOS export | Hermes bundle succeeded |
| Original SRS and UML SHA-256 recheck | All six original files matched |
| Source UTF-8 inspection | Passed |

## Browser scenarios

1. Login errors; registration validation and password visibility; customer and manager signup; registered-user login after reload; logout for both roles.
2. Categories, debounced search, no-results state, unavailable items, details, favourites, adding to cart, quantity changes, kitchen notes, invalid/valid promo, persisted cart, checkout validation, Takeaway order, details, all timed status stages, cleared cart, persisted orders and dark mode.
3. Reservation validation, future date/time, table selection, conflict prevention, manager acceptance/decline, customer cancellation and reload persistence.
4. Manager price validation/edit, availability, adding/removing items, persisted menu edits, customer cart synchronization and blocked checkout for unavailable food.
5. Dine In orders, Pending customer cancellation, repeated checkout without duplicate tab stacks, manager forward transitions, manager theme and logout.
6. Tablet layout at 1024x900, promo removal, clear cart and no horizontal page overflow.

The customer scenarios also run at a 390x844 phone viewport. Runtime page errors were checked in the main customer flow; none were observed. Phone dark-mode and tablet-menu screenshots are generated in `test-results`.

## Domain test coverage

- Menu size, IDs and category coverage.
- Signup email/password/name/confirmation/role validation.
- Required cart reducer actions and zero-quantity removal.
- Currency rounding, discount, tax/service, invalid promos and minimum re-evaluation.
- Cart synchronization when a price changes or an item is deleted.
- Order timers, cancellation rules, irreversible terminal states and manager forward updates.
- Checkout empty-cart, changed-price, unavailable-food and required-table validation.
- Real/past date checks, capacity, slot conflicts, pending holds, cancelled/declined release and confirmation validation.
- Menu add/edit/remove reducer behavior.

## Limits and installation findings

No feature from the requested Assignment 1 scope is intentionally unfinished. Physical Android/iOS devices and simulators were not available for interactive testing; native verification is successful bundling, not a claim of device testing.

`npm audit` reported **22 upstream dependency findings (7 moderate, 15 high)** in the Expo/React Native dependency tree. Its proposed automatic fix required downgrading Expo to 44 and React Native to 0.72, which would break the selected SDK pairing. No forced dependency downgrade was applied. The installed SDK-compatible versions pass Expo Doctor; the audit findings remain a dependency limitation.

The app's login is a frontend mock, not production authentication. Accounts and sample passwords are stored locally as requested. Data is not shared between devices. There is no real payment, backend, API, database or kitchen integration.

## Documentation preservation

The original SRS and five UML images were inspected before implementation, never regenerated, renamed or edited, and their checksums matched after implementation. `ORIGINAL_CHECKSUMS.json` records those values. See README for the mapping from UML MenuContext to RestaurantContext and for the provider/sequence/state-machine alignment.
