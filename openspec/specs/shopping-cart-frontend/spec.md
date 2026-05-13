## ADDED Requirements

### Requirement: Client can add a product to the cart with quantity
The system SHALL allow an authenticated client to add an available product to their cart, specifying quantity (minimum 1).

#### Scenario: Add new product to cart
- **WHEN** the authenticated client clicks "Agregar al carrito" on a product detail page and specifies quantity
- **THEN** the product appears in the cart with the correct quantity and subtotal

#### Scenario: Add existing product increments quantity
- **WHEN** the authenticated client adds a product already in the cart
- **THEN** the system increments the existing item's quantity (does NOT duplicate)

#### Scenario: Add with invalid quantity
- **WHEN** the authenticated client tries to add a product with quantity less than 1
- **THEN** the system prevents the action or defaults to quantity 1

### Requirement: Client can exclude ingredients when adding to cart
The system SHALL allow the authenticated client to select which removable ingredients to exclude when adding a product to the cart.

#### Scenario: Exclude removable ingredients
- **WHEN** the authenticated client selects ingredient checkboxes to exclude and adds the product to cart
- **THEN** the selected ingredient IDs are stored as `personalizacion` in the cart item

#### Scenario: Only removable ingredients are selectable
- **WHEN** viewing the ingredient list for a product
- **THEN** only ingredients marked as `es_removible` show checkboxes; non-removable ingredients are displayed as read-only

#### Scenario: Exclusion displayed in cart
- **WHEN** viewing an item in the cart that has excluded ingredients
- **THEN** the excluded ingredients are clearly shown (e.g., "Sin cebolla, sin pepino")

### Requirement: Client can modify item quantity in the cart
The system SHALL allow the authenticated client to increase or decrease the quantity of any item in the cart.

#### Scenario: Increase quantity
- **WHEN** the authenticated client increases the quantity of an item
- **THEN** the subtotal updates and changes persist to localStorage

#### Scenario: Decrease quantity to 0 removes item
- **WHEN** the authenticated client decreases the quantity of an item to 0 (or below 1)
- **THEN** the item is removed from the cart

#### Scenario: Quantity input has minimum of 1
- **WHEN** the authenticated client manually enters a quantity
- **THEN** values below 1 are clamped to 1 or trigger item removal

### Requirement: Client can remove an item from the cart
The system SHALL allow the authenticated client to remove a specific item from the cart.

#### Scenario: Remove item
- **WHEN** the authenticated client clicks the remove/delete button on an item
- **THEN** the item is removed from the cart and the total is recalculated

### Requirement: Client can view cart summary
The system SHALL display a complete summary of the cart with product name, quantity, unit price, exclusions, subtotal per item, and grand total.

#### Scenario: Cart with items shows summary
- **WHEN** the authenticated client navigates to `/cart`
- **THEN** they see all items with details, subtotals, and the total (2 decimal places)

#### Scenario: Empty cart shows message
- **WHEN** the authenticated client navigates to `/cart` and the cart is empty
- **THEN** they see a message "Tu carrito está vacío" with a link to the catalog

### Requirement: Client can view cart drawer from any page
The system SHALL provide a slide-out drawer accessible from any page showing a compact cart summary.

#### Scenario: Open cart drawer
- **WHEN** the authenticated client clicks the cart icon/badge in the navbar
- **THEN** a drawer slides in from the right showing cart items, subtotal, and a link to the full cart page

#### Scenario: Close cart drawer
- **WHEN** the drawer is open and the authenticated client clicks outside it or the close button
- **THEN** the drawer closes

#### Scenario: Empty state in drawer
- **WHEN** the drawer is opened and the cart is empty
- **THEN** a message "Tu carrito está vacío" is displayed

### Requirement: Client can clear the entire cart
The system SHALL allow the authenticated client to remove all items from the cart at once, with a confirmation dialog.

#### Scenario: Clear cart with confirmation
- **WHEN** the authenticated client clicks "Vaciar carrito" and confirms the dialog
- **THEN** all items are removed and the total becomes $0

#### Scenario: Cancel clear cart
- **WHEN** the authenticated client clicks "Vaciar carrito" but cancels the confirmation dialog
- **THEN** the cart remains unchanged

### Requirement: Cart badge shows item count in navbar
The system SHALL display a badge next to the cart link in the navbar showing the total number of items.

#### Scenario: Badge visible with items
- **WHEN** the cart has 1 or more items
- **THEN** a badge with the item count appears next to "Mi Carrito" in the navbar

#### Scenario: No badge when empty
- **WHEN** the cart is empty
- **THEN** no badge is shown next to "Mi Carrito"

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
