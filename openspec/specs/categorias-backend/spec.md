## MODIFIED Requirements

### Requirement: Category CRUD permissions

The system SHALL allow both ADMIN and STOCK roles to create, update, and delete categories. Previously only ADMIN was permitted.

#### Scenario: STOCK role creates a category
- **WHEN** a user with role STOCK sends `POST /api/v1/categorias` with valid data
- **THEN** the system creates the category and returns HTTP 201 Created

#### Scenario: STOCK role edits a category
- **WHEN** a user with role STOCK sends `PUT /api/v1/categorias/{id}` with valid data
- **THEN** the system updates the category and returns HTTP 200 OK

#### Scenario: STOCK role deletes a category
- **WHEN** a user with role STOCK sends `DELETE /api/v1/categorias/{id}` for a category without active subcategories
- **THEN** the system soft-deletes the category and returns HTTP 204 No Content

#### Scenario: CLIENT role attempts category write operation
- **WHEN** a user with role CLIENT sends any write request to `/api/v1/categorias`
- **THEN** the system returns HTTP 403 Forbidden

### Requirement: Category update with padre_id change and cycle detection

The system SHALL allow updating the `padre_id` of a category and SHALL validate that the change does not create a cycle in the hierarchy.

#### Scenario: Update padre_id without cycle
- **WHEN** a user sends `PUT /api/v1/categorias/{id}` with `padre_id` set to a category that is not a descendant of the updated category
- **THEN** the system persists the change and returns the updated category

#### Scenario: Set padre_id to self
- **WHEN** a user sends `PUT /api/v1/categorias/{id}` with `padre_id` set to the same category id
- **THEN** the system rejects with HTTP 409 Conflict and message "Se generaría un ciclo en la jerarquía"

#### Scenario: Set padre_id to descendant
- **WHEN** a user sends `PUT /api/v1/categorias/1` with `padre_id` set to category id 3, and category 3 is a descendant of category 1 (1 → 2 → 3)
- **THEN** the system rejects with HTTP 409 Conflict and message "Se generaría un ciclo en la jerarquía"

### Requirement: Category soft delete with subcategory validation

The system SHALL reject soft deletion of a category that has active (non-deleted) subcategories.

#### Scenario: Delete category with active subcategories
- **WHEN** a user sends `DELETE /api/v1/categorias/{id}` for a category that has one or more subcategories with `eliminado_en IS NULL`
- **THEN** the system returns HTTP 409 Conflict with message "No se puede eliminar una categoría con subcategorías activas"

#### Scenario: Delete category with only soft-deleted subcategories
- **WHEN** a user sends `DELETE /api/v1/categorias/{id}` for a category whose subcategories all have `eliminado_en IS NOT NULL`
- **THEN** the system soft-deletes the category successfully with HTTP 204 No Content