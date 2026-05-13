## ADDED Requirements

### Requirement: DataTable component

The system SHALL provide a reusable `<DataTable>` component for displaying tabular data with pagination.

#### Scenario: Basic table rendering
- **WHEN** a DataTable receives `columns` config and `data` array
- **THEN** it renders a table with headers from column labels and rows from data

#### Scenario: Pagination controls
- **WHEN** DataTable receives `total`, `page`, `limit`, and `onPageChange` props
- **THEN** it displays pagination controls (previous/next, page numbers) and calls `onPageChange` when the user navigates

#### Scenario: Empty state
- **WHEN** data array is empty
- **THEN** DataTable shows "No hay datos para mostrar" message

### Requirement: ConfirmDialog component

The system SHALL provide a reusable `<ConfirmDialog>` component for destructive action confirmation.

#### Scenario: Confirm delete
- **WHEN** a component renders ConfirmDialog with `title`, `message`, `onConfirm`, and `onCancel`
- **THEN** a modal dialog appears with the title, message, and two buttons: "Cancelar" (calls onCancel) and "Confirmar" (calls onConfirm)

#### Scenario: Confirm with item name
- **WHEN** ConfirmDialog message includes `{nombre}` placeholder
- **THEN** the placeholder is replaced with the actual item name for context

### Requirement: Toast notification component

The system SHALL provide `<Toast>` notifications for success, error, and warning messages.

#### Scenario: Success toast
- **WHEN** a mutation succeeds (create, update, delete)
- **THEN** a green success toast appears with the success message and auto-dismisses after 3 seconds

#### Scenario: Error toast
- **WHEN** an API call fails with an error response
- **THEN** a red error toast appears with the error message from the response body (RFC 7807 `detail` field)

#### Scenario: Validation error toast
- **WHEN** form validation fails
- **THEN** a warning toast appears listing the validation errors

### Requirement: ProtectedRoute component with RBAC

The system SHALL provide a `<ProtectedRoute>` component that restricts access to routes based on user roles.

#### Scenario: User with required role
- **WHEN** an authenticated user with role ADMIN or STOCK accesses a route protected by `requireRole(["ADMIN", "STOCK"])`
- **THEN** the route renders normally

#### Scenario: User without required role
- **WHEN** an authenticated user with role CLIENT accesses a route protected by `requireRole(["ADMIN", "STOCK"])`
- **THEN** the user is shown a 403 Forbidden page or redirected to the home page with an error toast

#### Scenario: Unauthenticated user
- **WHEN** an unauthenticated user accesses a protected route
- **THEN** the user is redirected to `/login`

### Requirement: FormField component

The system SHALL provide a reusable `<FormField>` component for form inputs with validation.

#### Scenario: Text input with label and validation
- **WHEN** a FormField renders with `type="text"`, `label`, `required`, and `error` props
- **THEN** it shows a label, input field, and error message below if validation fails

#### Scenario: Checkbox input
- **WHEN** a FormField renders with `type="checkbox"` and `label`
- **THEN** it shows a checkbox with the label text next to it

#### Scenario: Select/dropdown input
- **WHEN** a FormField renders with `type="select"` and `options` array
- **THEN** it shows a dropdown with the provided options