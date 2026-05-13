## ADDED Requirements

### Requirement: System validates product availability before checkout
The system SHALL provide a validation endpoint that checks stock availability, product status, and price changes for all items in the cart before order creation.

#### Scenario: All items valid
- **WHEN** the client sends a validation request with cart items that are all available and have sufficient stock
- **THEN** the system returns `{ valido: true }` with a list of validated items

#### Scenario: Product out of stock
- **WHEN** the client sends a validation request and a product has insufficient stock
- **THEN** the system returns `{ valido: false }` with an error indicating which product and available stock

#### Scenario: Product disabled or deleted
- **WHEN** the client sends a validation request and a product is no longer available or was soft-deleted
- **THEN** the system returns `{ valido: false }` with an error indicating the problematic product

### Requirement: System detects price changes since item was added to cart
The system SHALL compare the price stored in the cart item with the current database price during validation.

#### Scenario: Price unchanged
- **WHEN** the validation runs and all item prices match the current database prices
- **THEN** the response shows `hubo_cambio_precio: false` for all items

#### Scenario: Price has changed
- **WHEN** the validation runs and an item's price differs from the current database price
- **THEN** the response shows `hubo_cambio_precio: true`, `precio_original` (cart), and `precio_actual` (DB) for that item

#### Scenario: Client accepts new price
- **WHEN** the client is notified of a price change and chooses to continue
- **THEN** the order is created with the current (new) price
