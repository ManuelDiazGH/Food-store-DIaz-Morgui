## ADDED Requirements

### Requirement: Admin can activate/deactivate users
The system SHALL provide a `PATCH /api/v1/usuarios/{id}/estado` endpoint (ADMIN only) to toggle a user's `activo` status. Deactivated users SHALL be blocked from logging in.

### Requirement: Login rejects deactivated users
The system SHALL reject login attempts from users with `activo=false`, returning HTTP 403 with "Cuenta desactivada".

### Requirement: Admin can edit any user details
The system SHALL allow ADMIN role to edit nombre, telefono, and email of any user via the existing `PUT /api/v1/usuarios/{id}` endpoint, which SHALL accept ADMIN edits without ownership restriction.

## ADDED Requirements

### Requirement: Admin users page shows active/inactive status
The system SHALL display an "Estado" column in the admin users table showing whether each user is active or inactive, with a toggle action.

### Requirement: Admin users page has role filter
The system SHALL provide a role filter on the admin users page, allowing filtering by ADMIN, STOCK, PEDIDOS, or CLIENT roles.

### Requirement: Admin can edit user details from the UI
The system SHALL provide an edit modal on the admin users page that allows ADMIN to modify user nombre, telefono, and email.

## ADDED Requirements

### Requirement: Dashboard shows real metrics with cards
The system SHALL display metric cards on the admin dashboard: total usuarios, total pedidos, total productos, and total ventas, fetched from a backend endpoint.

### Requirement: Dashboard shows sales chart with period filter
The system SHALL display a line chart of sales over time, with granularity selector (día/semana/mes) and date range filter.

### Requirement: Dashboard shows top products chart
The system SHALL display a bar chart of the top N best-selling products.

### Requirement: Dashboard shows order status distribution
The system SHALL display a pie chart showing the distribution of orders by status.
