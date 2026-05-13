## ADDED Requirements

### Requirement: Category tree management page

The system SHALL provide an admin page (`/admin/categorias`) for managing categories in a hierarchical tree view, accessible only to ADMIN and STOCK roles.

#### Scenario: View category tree
- **WHEN** an ADMIN or STOCK user navigates to `/admin/categorias`
- **THEN** the page displays the full category hierarchy as a collapsible tree

#### Scenario: Create root category
- **WHEN** the user clicks "Nueva categoría" without selecting a parent
- **THEN** a form modal appears with fields: nombre (required), descripcion (optional), padre_id = null
- **THEN** on submit, a POST request creates the category and the tree refreshes

#### Scenario: Create subcategory
- **WHEN** the user clicks "Agregar subcategoría" on an existing category node
- **THEN** a form modal appears with the parent category pre-selected
- **THEN** on submit, a POST request creates the subcategory under the selected parent

#### Scenario: Edit category name, description, and parent
- **WHEN** the user clicks "Editar" on a category
- **THEN** a form modal appears with nombre, descripcion, and padre_id (editable dropdown showing valid parents)
- **THEN** the parent dropdown SHALL exclude the category itself and all its descendants to prevent cycles
- **THEN** on submit, a PUT request updates the category and the tree refreshes

#### Scenario: Delete category with active subcategories
- **WHEN** the user clicks "Eliminar" on a category that has active subcategories
- **THEN** the system shows an error message "No se puede eliminar una categoría con subcategorías activas. Reasigne o elimine las subcategorías primero."

#### Scenario: Delete leaf category
- **WHEN** the user clicks "Eliminar" on a leaf category (no active subcategories)
- **THEN** a confirmation dialog appears: "¿Está seguro de eliminar la categoría '{nombre}'?"
- **THEN** on confirm, a DELETE request soft-deletes the category and the tree refreshes

### Requirement: Category API hooks and store

The system SHALL provide TanStack Query hooks for category management.

#### Scenario: useCategoryTree hook
- **WHEN** a component calls `useCategoryTree()`
- **THEN** it fetches `GET /api/v1/categorias/tree` and returns the nested tree data with loading/error states

#### Scenario: useCategories hook
- **WHEN** a component calls `useCategories()`
- **THEN** it fetches `GET /api/v1/categorias` and returns the flat list with loading/error states

#### Scenario: useCreateCategory mutation
- **WHEN** the mutation is called with `CategoriaCreate` data
- **THEN** it POSTs to `/api/v1/categorias` and invalidates the category tree query on success

#### Scenario: useUpdateCategory mutation
- **WHEN** the mutation is called with id and `CategoriaUpdate` data
- **THEN** it PUTs to `/api/v1/categorias/{id}` and invalidates the category tree query on success

#### Scenario: useDeleteCategory mutation
- **WHEN** the mutation is called with an id
- **THEN** it DELETEs `/api/v1/categorias/{id}` and invalidates the category tree query on success