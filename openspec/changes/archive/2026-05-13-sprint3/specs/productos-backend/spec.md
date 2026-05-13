## ADDED Requirements

### Requirement: Associate product with categories (US-016)
The system SHALL allow STOCK and ADMIN roles to associate a product with one or more categories via `PUT /api/v1/productos/:id/categorias` with body `{"categoria_ids": [1, 3, 5]}`. The system SHALL replace all existing category associations with the new list (full replacement strategy). The system SHALL validate that all provided category IDs exist and are not soft-deleted. If any category ID is invalid, the system SHALL return 400 with RFC 7807 error.

#### Scenario: Successfully associate product with categories
- **WHEN** a STOCK or ADMIN user sends `PUT /api/v1/productos/1/categorias` with `{"categoria_ids": [1, 3]}`
- **THEN** the system replaces all category associations for product 1 with categories 1 and 3
- **THEN** returns 200 with the updated product including categories

#### Scenario: Reject invalid category IDs
- **WHEN** a STOCK or ADMIN user sends `PUT /api/v1/productos/1/categorias` with `{"categoria_ids": [999]}`
- **THEN** the system returns 400 with RFC 7807 error "Categoría no encontrada: 999"

#### Scenario: Reject unauthorized user
- **WHEN** a CLIENT user sends `PUT /api/v1/productos/1/categorias`
- **THEN** the system returns 403 Forbidden

### Requirement: Associate product with ingredients (US-017)
The system SHALL allow STOCK and ADMIN roles to associate ingredients with a product via `PUT /api/v1/productos/:id/ingredientes` with body `{"ingredientes": [{"ingrediente_id": 1, "es_removible": true}, {"ingrediente_id": 3, "es_removible": false}]}`. The system SHALL replace all existing ingredient associations. Ingredients marked as `es_alergeno=true` SHALL be highlighted in the product detail response. The system SHALL validate that all provided ingredient IDs exist and are not soft-deleted.

#### Scenario: Successfully associate ingredients
- **WHEN** a STOCK user sends `PUT /api/v1/productos/1/ingredientes` with ingredients list
- **THEN** the system replaces all ingredient associations with the new list
- **THEN** returns 200 with the updated product including ingredients with alergeno flags

#### Scenario: Reject non-existent ingredient
- **WHEN** a user sends `PUT /api/v1/productos/1/ingredientes` with `{"ingrediente_id": 999}`
- **THEN** the system returns 400 with RFC 7807 error "Ingrediente no encontrado: 999"

### Requirement: Public product catalog with filters (US-018)
The system SHALL provide a public endpoint `GET /api/v1/productos` that returns only available and non-deleted products. The system SHALL support the following query parameters: `categoria` (filter by category ID), `busqueda` (search by name using ILIKE), `page` (offset pagination, default 1), `limit` (items per page, default 20, max 100), `excluirAlergenos` (comma-separated ingredient IDs to exclude, US-023). The response SHALL include total count for pagination.

#### Scenario: Browse catalog without filters
- **WHEN** an anonymous user accesses `GET /api/v1/productos`
- **THEN** returns only products where `disponible=true AND eliminado_en IS NULL`
- **THEN** each product includes id, nombre, precio_base, imagen, disponible, categorias (names)

#### Scenario: Filter by category
- **WHEN** user accesses `GET /api/v1/productos?categoria=3`
- **THEN** returns only products associated with category ID 3 that are available and not deleted

#### Scenario: Search by name
- **WHEN** user accesses `GET /api/v1/productos?busqueda=pizza`
- **THEN** returns products where nombre ILIKE '%pizza%' and available and not deleted

#### Scenario: Paginated catalog
- **WHEN** user accesses `GET /api/v1/productos?page=2&limit=10`
- **THEN** returns items 11-20 with total count in response

#### Scenario: Admin sees all products including deleted
- **WHEN** an ADMIN user accesses `GET /api/v1/productos?incluir_eliminados=true`
- **THEN** returns all products including soft-deleted ones

### Requirement: Product detail with ingredients and alergenos (US-019)
The system SHALL provide a public endpoint `GET /api/v1/productos/:id` that returns full product detail including: nombre, descripcion, precio_base, imagen, `hay_stock` (boolean: stock_cantidad > 0), categorias (id, nombre), ingredientes (id, nombre, es_alergeno, es_removible). The system SHALL NOT reveal exact stock quantity to public users. If the product is not available or soft-deleted, the system SHALL return 404.

#### Scenario: View product detail
- **WHEN** a user accesses `GET /api/v1/productos/1` for an available product
- **THEN** returns product detail with categories, ingredients, and `hay_stock=true` if stock > 0

#### Scenario: Product not found
- **WHEN** a user accesses `GET /api/v1/productos/999`
- **THEN** returns 404 with RFC 7807 error

#### Scenario: Product soft-deleted returns 404
- **WHEN** a user accesses `GET /api/v1/productos/5` where the product has `eliminado_en` set
- **THEN** returns 404

### Requirement: Edit product (US-020)
The system SHALL allow STOCK and ADMIN roles to edit product fields via `PUT /api/v1/productos/:id`. The system SHALL validate: precio_base > 0 with max 2 decimal places, stock_cantidad >= 0, nombre min 2 chars. Only provided fields SHALL be updated (partial update semantics). The system SHALL return 404 for non-existent or soft-deleted products.

#### Scenario: Successfully update product
- **WHEN** a STOCK user sends `PUT /api/v1/productos/1` with `{"nombre": "Pizza Margherita", "precio_base": 25.99}`
- **THEN** only nombre and precio_base are updated, other fields remain unchanged

#### Scenario: Reject negative stock
- **WHEN** a STOCK user sends `PUT /api/v1/productos/1` with `{"stock_cantidad": -5}`
- **THEN** returns 422 validation error

### Requirement: Atomic stock management (US-021)
The system SHALL provide `PATCH /api/v1/productos/:id/stock` for atomic stock updates. The body SHALL accept `{"cantidad": N, "tipo": "incremento"|"absoluto"}`. When tipo is "incremento", the system SHALL atomically add N to current stock. When tipo is "absoluto", the system SHALL set stock to N. The system SHALL reject updates that would result in negative stock. This endpoint SHALL be restricted to STOCK and ADMIN roles.

#### Scenario: Increment stock atomically
- **WHEN** a STOCK user sends `PATCH /api/v1/productos/1/stock` with `{"cantidad": 10, "tipo": "incremento"}`
- **THEN** stock_cantidad increases by 10 atomically (uses SQL UPDATE with WHERE)

#### Scenario: Set absolute stock
- **WHEN** a STOCK user sends `PATCH /api/v1/productos/1/stock` with `{"cantidad": 50, "tipo": "absoluto"}`
- **THEN** stock_cantidad is set to 50

#### Scenario: Reject negative stock result
- **WHEN** decrementing stock would result in negative value (e.g., current stock 3, decrement by 10)
- **THEN** returns 400 error "Stock insuficiente"

### Requirement: Soft delete product (US-022)
The system SHALL implement soft delete on `DELETE /api/v1/productos/:id` by setting `eliminado_en` to current timestamp. The product SHALL NOT appear in public catalog queries. The system SHALL return 404 if the product is already soft-deleted. This endpoint SHALL be restricted to ADMIN role. Products referenced in existing orders (via DetallePedido) SHALL retain their data through snapshots.

#### Scenario: Soft delete a product
- **WHEN** an ADMIN sends `DELETE /api/v1/productos/1`
- **THEN** sets `eliminado_en = now()` and returns 204 No Content

#### Scenario: Already deleted product
- **WHEN** an ADMIN sends `DELETE /api/v1/productos/1` for an already deleted product
- **THEN** returns 404

### Requirement: Filter products by alergenos (US-023)
The system SHALL support `?excluirAlergenos=1,3,7` query parameter on the product catalog endpoint. The system SHALL exclude products that contain ANY of the specified ingredient IDs using `NOT EXISTS` subquery over `ProductoIngrediente`. This filter SHALL only work on public (available, non-deleted) products.

#### Scenario: Exclude products with alergenos
- **WHEN** user accesses `GET /api/v1/productos?excluirAlergenos=1,3`
- **THEN** returns products that do NOT contain ingredients with IDs 1 or 3

#### Scenario: Combine filters
- **WHEN** user accesses `GET /api/v1/productos?categoria=2&excluirAlergenos=5&busqueda=ensalada`
- **THEN** returns products matching all three filters simultaneously