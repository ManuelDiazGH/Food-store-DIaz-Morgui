## ADDED Requirements

### Requirement: System snapshots delivery address at order creation
The system SHALL copy the delivery address details into the Pedido at creation time, making them immutable for that order.

#### Scenario: Snapshot address on create
- **WHEN** a pedido is created with a `direccion_id`
- **THEN** the system copies the address fields (linea1, linea2, ciudad, cp, alias) into dedicated snapshot columns in the Pedido record

#### Scenario: Address changes after order created
- **WHEN** the client modifies their address after the order is created
- **THEN** the pedido retains the original address snapshot

### Requirement: System validates stock atomically within create transaction
The system SHALL verify stock availability for ALL items within the database transaction using `SELECT FOR UPDATE`, rejecting the entire order if any item lacks stock.

#### Scenario: Sufficient stock for all items
- **WHEN** all items in the order have sufficient stock
- **THEN** the order is created and stock is decremented atomically

#### Scenario: Insufficient stock
- **WHEN** one or more items lack sufficient stock
- **THEN** the entire order is rejected, no partial order is created, and an error is returned indicating which items failed
