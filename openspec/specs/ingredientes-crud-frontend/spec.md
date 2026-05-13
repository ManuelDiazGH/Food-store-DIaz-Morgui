## ADDED Requirements

### Requirement: Ingredient management page

The system SHALL provide an admin page (`/admin/ingredientes`) for managing ingredients, accessible only to ADMIN and STOCK roles.

#### Scenario: View ingredients list
- **WHEN** an ADMIN or STOCK user navigates to `/admin/ingredientes`
- **THEN** the page displays a paginated table of ingredients with columns: nombre, es_alergeno (badge), creado_en, acciones

#### Scenario: Filter by allergen status
- **WHEN** the user toggles the "Solo alérgenos" filter
- **THEN** the table fetches `GET /api/v1/ingredientes?alergeno=true` and shows only ingredients marked as allergens

#### Scenario: Create ingredient
- **WHEN** the user clicks "Nuevo ingrediente"
- **THEN** a form modal appears with fields: nombre (required), es_alergeno (checkbox, default false)
- **THEN** on submit, a POST request creates the ingredient and the table refreshes

#### Scenario: Edit ingredient
- **WHEN** the user clicks "Editar" on an ingredient row
- **THEN** a form modal appears with nombre and es_alergeno pre-filled
- **THEN** on submit, a PUT request updates the ingredient and the table refreshes

#### Scenario: Delete ingredient
- **WHEN** the user clicks "Eliminar" on an ingredient row
- **THEN** a confirmation dialog appears: "¿Está seguro de eliminar el ingrediente '{nombre}'?"
- **THEN** on confirm, a DELETE request soft-deletes the ingredient and the table refreshes

### Requirement: Ingredient API hooks

The system SHALL provide TanStack Query hooks for ingredient management.

#### Scenario: useIngredients hook with filters
- **WHEN** a component calls `useIngredients({ alergeno, page, limit })`
- **THEN** it fetches `GET /api/v1/ingredientes` with query params and returns paginated data with loading/error states

#### Scenario: useCreateIngredient mutation
- **WHEN** the mutation is called with `IngredienteCreate` data
- **THEN** it POSTs to `/api/v1/ingredientes` and invalidates the ingredients query on success

#### Scenario: useUpdateIngredient mutation
- **WHEN** the mutation is called with id and `IngredienteUpdate` data
- **THEN** it PUTs to `/api/v1/ingredientes/{id}` and invalidates the ingredients query on success

#### Scenario: useDeleteIngredient mutation
- **WHEN** the mutation is called with an id
- **THEN** it DELETEs `/api/v1/ingredientes/{id}` and invalidates the ingredients query on success