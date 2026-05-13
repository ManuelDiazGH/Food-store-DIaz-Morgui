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
