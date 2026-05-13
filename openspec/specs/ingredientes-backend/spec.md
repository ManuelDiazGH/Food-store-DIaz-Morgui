## MODIFIED Requirements

### Requirement: Ingredient CRUD permissions

The system SHALL allow both ADMIN and STOCK roles to create, update, and delete ingredients. Previously only ADMIN was permitted.

#### Scenario: STOCK role creates an ingredient
- **WHEN** a user with role STOCK sends `POST /api/v1/ingredientes` with valid data (nombre, es_alergeno)
- **THEN** the system creates the ingredient and returns HTTP 201 Created

#### Scenario: STOCK role edits an ingredient
- **WHEN** a user with role STOCK sends `PUT /api/v1/ingredientes/{id}` with valid data
- **THEN** the system updates the ingredient and returns HTTP 200 OK

#### Scenario: STOCK role deletes an ingredient
- **WHEN** a user with role STOCK sends `DELETE /api/v1/ingredientes/{id}`
- **THEN** the system soft-deletes the ingredient and returns HTTP 204 No Content

#### Scenario: CLIENT role attempts ingredient write operation
- **WHEN** a user with role CLIENT sends any write request to `/api/v1/ingredientes`
- **THEN** the system returns HTTP 403 Forbidden