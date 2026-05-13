## MODIFIED Requirements

### Requirement: Client can proceed to checkout from cart page
**Previously:** The "Proceder al checkout" button was disabled with a note that checkout was coming in a future sprint.
**Now:** The button SHALL be enabled when the cart has items and the client is authenticated, navigating to `/checkout`.

#### Scenario: Proceed to checkout enabled
- **WHEN** the authenticated client has items in the cart
- **THEN** the "Proceder al checkout" button is enabled and navigates to the checkout page

#### Scenario: Cart cleared after order creation
- **WHEN** an order is created successfully
- **THEN** the Zustand cart store is cleared (all items removed)
