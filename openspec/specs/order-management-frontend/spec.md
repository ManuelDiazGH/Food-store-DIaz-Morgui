## ADDED Requirements

### Requirement: Gestor can view all orders in a management panel
The system SHALL display all orders from all clients in a management interface accessible to users with PEDIDOS or ADMIN role.

#### Scenario: View all orders
- **WHEN** an authenticated user with PEDIDOS or ADMIN role navigates to `/orders-panel`
- **THEN** they see a table of all orders with: order number, client name, date, status badge, total, items count

#### Scenario: Filter orders by status
- **WHEN** the gestor selects a status filter
- **THEN** the table shows only orders with the selected status

#### Scenario: Pagination
- **WHEN** there are more orders than the page limit
- **THEN** pagination controls are shown

### Requirement: Gestor can advance order state (FSM)
The system SHALL provide action buttons for valid state transitions according to the FSM, contextual to each order's current state.

#### Scenario: Advance from CONFIRMADO to EN_PREPARACION
- **WHEN** the gestor clicks "Iniciar preparación" on a CONFIRMADO order
- **THEN** the order transitions to EN_PREPARACION and a history entry is created

#### Scenario: Advance from EN_PREPARACION to EN_CAMINO
- **WHEN** the gestor clicks "Marcar en camino" on an EN_PREPARACION order
- **THEN** the order transitions to EN_CAMINO

#### Scenario: Advance from EN_CAMINO to ENTREGADO
- **WHEN** the gestor clicks "Marcar entregado" on an EN_CAMINO order
- **THEN** the order transitions to ENTREGADO (terminal state)

#### Scenario: Buttons are contextual
- **WHEN** viewing an order in PENDIENTE state
- **THEN** no advance buttons are shown (only CONFIRMAR is automatic via payment)
- **WHEN** viewing an order in ENTREGADO or CANCELADO state
- **THEN** no action buttons are shown (terminal states)

### Requirement: Gestor can cancel orders
The system SHALL allow the gestor to cancel orders in PENDIENTE or CONFIRMADO state with a required reason.

#### Scenario: Cancel PENDIENTE order
- **WHEN** the gestor clicks "Cancelar" on a PENDIENTE order and provides a reason in the confirmation modal
- **THEN** the order transitions to CANCELADO (terminal state)

#### Scenario: Cancel CONFIRMADO order with stock restoration
- **WHEN** the gestor cancels a CONFIRMADO order
- **THEN** the stock for each product is restored, and the order transitions to CANCELADO

#### Scenario: Cannot cancel orders in non-cancellable states
- **WHEN** the gestor tries to cancel an order in EN_PREPARACION, EN_CAMINO, or ENTREGADO
- **THEN** the cancel button is not available

#### Scenario: Reason is required for cancellation
- **WHEN** the gestor attempts to cancel without providing a reason
- **THEN** the system shows a validation error and does not process the cancellation
