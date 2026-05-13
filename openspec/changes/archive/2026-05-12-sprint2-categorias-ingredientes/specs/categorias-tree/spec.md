## ADDED Requirements

### Requirement: CTE recursive endpoint for category tree

The system SHALL provide a public endpoint `GET /api/v1/categorias/tree` that returns the complete category hierarchy as a nested tree structure using a PostgreSQL CTE recursive query.

#### Scenario: List full category tree
- **WHEN** a client requests `GET /api/v1/categorias/tree`
- **THEN** the system returns a JSON array of root categories, each containing a `subcategorias` field with its children recursively, and only categories with `eliminado_en IS NULL` are included

#### Scenario: Empty category tree
- **WHEN** no active categories exist (all are soft-deleted)
- **THEN** the system returns an empty array `[]`

#### Scenario: Category with multiple levels of nesting
- **WHEN** a root category has children, and those children have their own children
- **THEN** each level is nested under the `subcategorias` field of its parent, forming a complete tree of arbitrary depth

### Requirement: Cycle detection in category hierarchy

The system SHALL prevent cycles in the category hierarchy when updating `padre_id`.

#### Scenario: Setting padre_id creates a direct cycle
- **WHEN** a user updates category A setting `padre_id` to category B, and B is a child of A (or A itself)
- **THEN** the system rejects the update with HTTP 409 Conflict and message "Se generaría un ciclo en la jerarquía"

#### Scenario: Setting padre_id creates an indirect cycle
- **WHEN** a user updates category A setting `padre_id` to category C, and C is a descendant of A (A → B → C → ...)
- **THEN** the system rejects the update with HTTP 409 Conflict

#### Scenario: Valid padre_id change
- **WHEN** a user updates category A setting `padre_id` to category D, and D is not a descendant of A
- **THEN** the system accepts the update and persists the change

### Requirement: Soft delete validation for categories with subcategories

The system SHALL reject soft delete of a category that has active subcategories.

#### Scenario: Delete category with active subcategories
- **WHEN** a user attempts to delete category A that has subcategories with `eliminado_en IS NULL`
- **THEN** the system rejects with HTTP 409 Conflict and message "No se puede eliminar una categoría con subcategorías activas"

#### Scenario: Delete category with only soft-deleted subcategories
- **WHEN** a user attempts to delete category A that only has subcategories with `eliminado_en IS NOT NULL`
- **THEN** the system accepts the soft delete and marks the category as `eliminado_en = now()`

#### Scenario: Delete leaf category
- **WHEN** a user deletes a category with no subcategories
- **THEN** the system performs soft delete successfully

### Requirement: Category tree response schema

The system SHALL define a `CategoriaTreeNode` schema for tree responses separate from the flat `CategoriaRead` schema.

#### Scenario: TreeNode structure
- **WHEN** the system returns a category via the `/tree` endpoint
- **THEN** each node contains: `id`, `nombre`, `descripcion`, `padre_id`, `subcategorias` (recursive list of `CategoriaTreeNode`), and `eliminado_en` is excluded (only active categories)

#### Scenario: TreeNode for leaf category
- **WHEN** a category has no subcategories
- **THEN** its `subcategorias` field is an empty list `[]`