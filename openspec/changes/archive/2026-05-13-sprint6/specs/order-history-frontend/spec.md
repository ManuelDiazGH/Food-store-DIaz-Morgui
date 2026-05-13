## MODIFIED Requirements

### Requirement: Client can view payment status in order detail
The system SHALL display the payment status for each order in the order detail page.

#### Scenario: Show approved payment
- **WHEN** the authenticated client views an order with an approved payment
- **THEN** they see a green "Pagado" badge with the payment amount

#### Scenario: Show rejected payment with retry
- **WHEN** the authenticated client views an order with a rejected payment
- **THEN** they see a red "Pago rechazado" badge and a "Reintentar pago" button

#### Scenario: Show pending payment
- **WHEN** the authenticated client views an order with a pending payment
- **THEN** they see a yellow "Pago pendiente" badge

#### Scenario: Retry payment creates new payment
- **WHEN** the authenticated client clicks "Reintentar pago"
- **THEN** a new payment preference is created with a new idempotency key and the client is redirected to MP
