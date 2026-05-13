## ADDED Requirements

### Requirement: Client can view their orders list
The system SHALL display a paginated list of the authenticated client's orders, sorted by most recent first.

#### Scenario: View orders list
- **WHEN** the authenticated client navigates to `/orders`
- **THEN** they see a list of their orders with: order number, date, status, total, item count

#### Scenario: Filter orders by status
- **WHEN** the authenticated client selects a status filter
- **THEN** the list is filtered to show only orders with that status

#### Scenario: Empty orders list
- **WHEN** the client has no orders
- **THEN** a message "No tenés pedidos aún" is shown with a link to the catalog

#### Scenario: Error loading orders
- **WHEN** the API call fails
- **THEN** an error message with retry option is displayed

### Requirement: Client can view order detail
The system SHALL display the complete detail of a specific order, including items with snapshots, status history, and delivery address.

#### Scenario: View order detail
- **WHEN** the authenticated client navigates to `/orders/:id`
- **THEN** they see: items (name, quantity, price snapshot, exclusions), delivery address snapshot, current status with badge, total, status history timeline

#### Scenario: Order not found
- **WHEN** the order ID does not exist
- **THEN** a 404 page is shown

#### Scenario: Cannot view another client's order
- **WHEN** an authenticated client tries to view an order belonging to another user
- **THEN** a 403 Forbidden error is shown

### Requirement: System exposes order history endpoint
The system SHALL provide a `GET /api/pedidos/{id}/historial` endpoint that returns the chronological state transition history.

#### Scenario: Get state history
- **WHEN** a client or gestor requests the state history of an order
- **THEN** the system returns a list of transitions ordered by date, each with: previous state, new state, timestamp, actor, and reason (if cancellation)
