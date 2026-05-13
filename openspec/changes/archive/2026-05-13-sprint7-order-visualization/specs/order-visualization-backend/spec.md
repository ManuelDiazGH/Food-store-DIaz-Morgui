## ADDED Requirements

### Requirement: Backend supports searching and filtering all orders
The system SHALL provide query parameters on `GET /api/v1/pedidos` for: `q` (search by order ID or client name), `desde`/`hasta` (ISO date range), `estado` (status filter), and `page`/`limit` (server-side pagination). The endpoint SHALL be accessible to PEDIDOS and ADMIN roles.

### Requirement: Backend returns paginated order list
The system SHALL return a paginated response with `items: Pedido[]`, `total`, `page`, `limit` when using the all-orders endpoint.

## ADDED Requirements

### Requirement: Gestor/Admin can view any order detail with client info
The system SHALL provide a detail endpoint that returns the full order including: items with snapshots, delivery address snapshot, status history with actor info, payment status, and client data (nombre, email).

### Requirement: Gestor can transition order states from detail page
The system SHALL allow PEDIDOS and ADMIN roles to trigger FSM state transitions directly from the order detail page using the existing PATCH endpoint.

## ADDED Requirements

### Requirement: Orders panel has search bar with date range and text search
The system SHALL provide a search bar in the orders panel that allows: text search by order number or client name, date range filter (desde/hasta), and status filter. Filters SHALL trigger server-side queries.

### Requirement: Orders panel uses server-side pagination
The system SHALL paginate orders server-side with configurable page size. The UI SHALL show page controls and total count.
