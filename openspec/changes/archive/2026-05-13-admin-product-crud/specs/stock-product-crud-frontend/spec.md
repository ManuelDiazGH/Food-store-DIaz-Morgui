## ADDED Requirements

### Requirement: Stock/Admin can view all products in a management table
The system SHALL provide a page at `/stock/productos` (roles STOCK, ADMIN) displaying a paginated table of all products with columns: nombre, precio_base, stock_cantidad, disponible, categorias. Each row SHALL have action buttons for editar, eliminar, and gestionar stock.

### Requirement: Stock/Admin can create a new product
The system SHALL provide a page at `/stock/productos/nuevo` (roles STOCK, ADMIN) with a form to create a product: nombre, descripcion, precio_base, stock_cantidad, imagen URL, disponible toggle, and multi-selects for asociar categorias and ingredientes (with es_removible toggle).

### Requirement: Stock/Admin can edit an existing product
The system SHALL provide a page at `/stock/productos/:id/editar` (roles STOCK, ADMIN) that precarga the product's existing data including categorias and ingredientes associations, and allows updating all fields.

### Requirement: Stock/Admin can manage product stock
The system SHALL provide a modal for adjusting product stock in two modes: increment (add quantity) or absolute (set exact quantity), with validation preventing negative stock.

### Requirement: Stock/Admin can soft-delete a product
The system SHALL allow ADMIN role to soft-delete a product via the management table, with a confirmation dialog. The product SHALL be marked with eliminado_en timestamp and excluded from all lists.

### Requirement: Navbar shows Catalog and Profile links
The system SHALL display a "Catálogo" link in the navbar for CLIENT and ADMIN roles, and a "Mi Perfil" link for all authenticated users.
