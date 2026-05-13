## ADDED Requirements

### Requirement: Product catalog page (US-018)
The frontend SHALL display a public product catalog at `/` route with a responsive grid of ProductCard components. Each card SHALL show product name, price, image, and availability indicator. The page SHALL support pagination (page-based), category filtering, name search, and alergeno exclusion filters.

#### Scenario: Browse catalog as anonymous user
- **WHEN** a user navigates to `/`
- **THEN** the page displays available, non-deleted products in a responsive grid
- **THEN** each ProductCard shows nombre, precio_base, imagen, and disponible indicator

#### Scenario: Filter by category
- **WHEN** user selects a category from the sidebar/filter
- **THEN** only products in that category are displayed

#### Scenario: Search by name
- **WHEN** user types in the search box
- **THEN** products are filtered by nombre matching the search term (debounced)

#### Scenario: Pagination
- **WHEN** there are more products than the page limit
- **THEN** pagination controls appear at the bottom

### Requirement: Product detail page (US-019)
The frontend SHALL display a product detail page at `/productos/:id` showing: nombre, descripcion, precio_base, imagen, stock availability (hay_stock boolean), categories list, and ingredients list with alergeno flags highlighted. If the product is not found, display a 404 message.

#### Scenario: View product detail
- **WHEN** user navigates to `/productos/1`
- **THEN** page shows full product info with categories and ingredients
- **THEN** alergeno ingredients are visually highlighted (e.g., red badge, warning icon)

#### Scenario: Product not found
- **WHEN** user navigates to `/productos/999`
- **THEN** page shows 404 message with link back to catalog

### Requirement: Alergeno exclusion filter (US-023)
The frontend SHALL provide a filter panel with checkboxes for each alergeno ingredient. When checked, products containing those ingredients SHALL be excluded from the catalog. The filter SHALL send `?excluirAlergenos=id1,id2,...` to the API.

#### Scenario: Exclude alergenos
- **WHEN** user checks "Maní" and "Mariscos" checkboxes
- **THEN** the catalog refreshes excluding products containing those alergenos

### Requirement: Stock admin product management (US-015, US-016, US-017, US-020, US-021, US-022)
The frontend SHALL provide admin pages for product CRUD accessible to STOCK and ADMIN roles at `/stock/productos`. This includes: create product form, edit product form, category association (multi-select), ingredient association (multi-select with removible flag), stock management (increment/absolute), and soft delete.

#### Scenario: Create product
- **WHEN** a STOCK user navigates to `/stock/productos/nuevo`
- **THEN** form shows fields: nombre, descripcion, precio_base, stock_cantidad, imagen, disponible
- **THEN** on submit, creates product and redirects to product list

#### Scenario: Associate categories
- **WHEN** editing a product, user can select multiple categories from a multi-select
- **THEN** on save, PUT /productos/:id/categorias is called with the full list

#### Scenario: Associate ingredients
- **WHEN** editing a product, user can select ingredients with es_removible toggle
- **THEN** on save, PUT /productos/:id/ingredientes is called with the full list

#### Scenario: Manage stock
- **WHEN** STOCK user clicks "Gestionar Stock" on a product
- **THEN** modal/form shows current stock with options to increment or set absolute value

#### Scenario: Soft delete product
- **WHEN** ADMIN clicks "Eliminar" on a product
- **THEN** confirmation dialog appears; on confirm, sends DELETE and product disappears from list