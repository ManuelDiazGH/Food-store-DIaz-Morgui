## ADDED Requirements

### Requirement: Client can list their delivery addresses
The system SHALL display all active delivery addresses for the authenticated client, clearly indicating which one is the default.

#### Scenario: List addresses when user has addresses
- **WHEN** the authenticated client navigates to `/addresses`
- **THEN** the system displays a list of their addresses with alias, full address, city, and default indicator

#### Scenario: List addresses when user has no addresses
- **WHEN** the authenticated client navigates to `/addresses` and has no saved addresses
- **THEN** the system displays an empty state message with a button to create a new address

#### Scenario: Error loading addresses
- **WHEN** the API call to fetch addresses fails
- **THEN** the system displays an error message with a retry option

### Requirement: Client can create a delivery address
The system SHALL allow an authenticated client to add a new delivery address with alias (optional), street address, apartment (optional), city, and postal code.

#### Scenario: Create address successfully
- **WHEN** the authenticated client fills in the address form and submits
- **THEN** the system creates the address and shows it in the list

#### Scenario: Create first address sets it as default
- **WHEN** the authenticated client creates their first address
- **THEN** the system auto-marks it as `es_principal: true`

#### Scenario: Validation errors on create
- **WHEN** the authenticated client submits the form with missing required fields (linea1, ciudad, cp)
- **THEN** the system shows inline validation errors and does NOT submit

### Requirement: Client can edit a delivery address
The system SHALL allow an authenticated client to update their existing address fields (partial update).

#### Scenario: Edit address successfully
- **WHEN** the authenticated client modifies an existing address and submits
- **THEN** the system persists the changes and updates the displayed address

#### Scenario: Cannot edit another user's address
- **WHEN** a client attempts to edit an address belonging to another user
- **THEN** the backend returns 404 (via ownership validation in service)

### Requirement: Client can delete a delivery address
The system SHALL allow an authenticated client to soft-delete their address.

#### Scenario: Delete address successfully
- **WHEN** the authenticated client confirms deletion of an address
- **THEN** the system soft-deletes it and removes it from the list

#### Scenario: Delete default address reassigns default
- **WHEN** the authenticated client deletes the address that was marked as default
- **THEN** the system removes the default flag (another address must be manually set as default)

### Requirement: Client can set a default delivery address
The system SHALL allow the authenticated client to mark one address as default. Only one address can be default at a time.

#### Scenario: Set default address
- **WHEN** the authenticated client clicks "Set as default" on an address
- **THEN** the system marks that address as `es_principal: true` and removes the flag from the previous default

#### Scenario: Default address is visually distinct
- **WHEN** viewing the address list
- **THEN** the default address is visually highlighted (badge, different background, or similar indicator)
