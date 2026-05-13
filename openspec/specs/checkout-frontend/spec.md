## ADDED Requirements

### Requirement: Client can proceed to checkout from cart
The system SHALL allow the authenticated client to navigate from the cart page to a checkout page.

#### Scenario: Proceed to checkout
- **WHEN** the authenticated client has items in the cart and clicks "Proceder al checkout"
- **THEN** the system navigates to `/checkout` showing a summary of cart items

#### Scenario: Empty cart cannot checkout
- **WHEN** the cart is empty
- **THEN** the "Proceder al checkout" button is disabled

### Requirement: Client selects delivery address during checkout
The system SHALL display the client's saved addresses and allow selecting one for the order.

#### Scenario: Select delivery address
- **WHEN** the authenticated client is on the checkout page
- **THEN** they see a list of their addresses with radio buttons, default address pre-selected

#### Scenario: No addresses saved
- **WHEN** the client has no saved addresses
- **THEN** a message is shown with a link to add an address before proceeding

### Requirement: Client can confirm and create an order
The system SHALL create a pedido via `POST /api/pedidos` with the selected address, cart items, and payment method, then clear the cart on success.

#### Scenario: Create order successfully
- **WHEN** the authenticated client confirms the order with a selected address and form of payment
- **THEN** the system creates the pedido, clears the cart, and redirects to the order detail page with a success message

#### Scenario: Order creation fails (stock, price, etc.)
- **WHEN** the order creation fails due to stock or availability issues
- **THEN** the system shows the error and keeps the cart intact for the client to adjust

### Requirement: Order confirmation screen
The system SHALL display a confirmation after successful order creation with order summary.

#### Scenario: Show confirmation
- **WHEN** the order is created successfully
- **THEN** the client sees the order number, items summary, total, delivery address, and status "PENDIENTE - Esperando pago"

## MODIFIED Requirements

### Requirement: Client can pay with MercadoPago after order creation
The system SHALL allow the client to pay for a newly created order by redirecting to MercadoPago checkout.

#### Scenario: Redirect to MercadoPago after order creation
- **WHEN** the order is created successfully
- **THEN** the system creates a MercadoPago payment preference and redirects the client to the MP checkout URL

#### Scenario: Payment URL returned
- **WHEN** the client completes checkout
- **THEN** the system displays a "Pagar con MercadoPago" button that opens the MP payment page

#### Scenario: Success callback
- **WHEN** the client returns from MercadoPago after a successful payment
- **THEN** they see the order detail page with status CONFIRMADO and a success message

#### Scenario: Failure callback
- **WHEN** the client returns from MercadoPago after a rejected payment
- **THEN** they see the order detail page with status PENDIENTE, an error message, and a "Reintentar pago" button

#### Scenario: Pending callback
- **WHEN** the client returns from MercadoPago with a pending payment
- **THEN** they see a message indicating the payment is being processed
