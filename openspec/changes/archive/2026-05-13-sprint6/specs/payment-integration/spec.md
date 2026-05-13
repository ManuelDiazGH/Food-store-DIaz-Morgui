## ADDED Requirements

### Requirement: System creates MercadoPago payment preference
The system SHALL create a payment preference/order in MercadoPago via the SDK when a client initiates payment for a pedido.

#### Scenario: Create payment preference successfully
- **WHEN** the authenticated client initiates payment for a pedido in PENDIENTE state
- **THEN** the system creates a payment preference in MercadoPago via the SDK and returns the payment URL (init_point)

#### Scenario: Payment preference creation fails
- **WHEN** the MercadoPago API returns an error
- **THEN** the system returns an error message and the pedido remains in PENDIENTE state

#### Scenario: Idempotency on payment creation
- **WHEN** the same request is sent twice with the same pedido_id
- **THEN** the system uses the existing idempotency key and does not create duplicate payment records

### Requirement: System processes MercadoPago IPN webhook
The system SHALL receive and process MercadoPago IPN notifications, updating payment status and advancing the order FSM when appropriate.

#### Scenario: Webhook with approved payment
- **WHEN** a webhook notification with status `approved` is received for a valid mp_payment_id
- **THEN** the system updates the pago status to APPROVED and transitions the pedido from PENDIENTE to CONFIRMADO

#### Scenario: Webhook with rejected payment
- **WHEN** a webhook notification with status `rejected` is received
- **THEN** the system updates the pago status to REJECTED and the pedido remains in PENDIENTE

#### Scenario: Webhook with pending payment
- **WHEN** a webhook notification with status `pending` or `in_process` is received
- **THEN** the system updates the pago status to IN_PROCESS and the pedido stays PENDIENTE

#### Scenario: Idempotent webhook processing
- **WHEN** the same webhook notification is received twice
- **THEN** the second processing does not cause duplicate state transitions

### Requirement: Client can retry a rejected payment
The system SHALL allow the client to retry payment for a pedido that has a rejected payment.

#### Scenario: Retry rejected payment
- **WHEN** the authenticated client clicks "Reintentar pago" on a pedido with rejected payment
- **THEN** the system creates a new payment record with a new idempotency key and initiates a new MercadoPago preference

#### Scenario: Retry only allowed when pedido is PENDIENTE
- **WHEN** the pedido is not in PENDIENTE state
- **THEN** the retry option is not available
