## ADDED Requirements

### Requirement: View own profile (US-061)
The system SHALL provide `GET /api/v1/perfil` that returns the authenticated user's profile data: nombre, email, telefono, fecha_registro. The endpoint SHALL extract the user ID from the JWT token. The system SHALL NOT allow a user to view another user's profile data.

#### Scenario: View own profile successfully
- **WHEN** an authenticated user sends `GET /api/v1/perfil` with valid JWT
- **THEN** returns `{"id": 1, "nombre": "Juan", "email": "juan@test.com", "telefono": "+54911...", "fecha_registro": "2025-01-01T00:00:00Z"}`

#### Scenario: Reject unauthenticated request
- **WHEN** an anonymous user sends `GET /api/v1/perfil` without JWT
- **THEN** returns 401 Unauthorized

### Requirement: Edit own profile (US-062)
The system SHALL provide `PUT /api/v1/perfil` to update nombre and telefono. The email field SHALL NOT be modifiable (it is the user identifier). The system SHALL validate telefono format if provided. Only the authenticated user's own data SHALL be modifiable.

#### Scenario: Update nombre and telefono
- **WHEN** an authenticated user sends `PUT /api/v1/perfil` with `{"nombre": "Juan Pérez", "telefono": "+54911123456"}`
- **THEN** updates the user's nombre and telefono
- **THEN** returns 200 with updated profile

#### Scenario: Email cannot be changed
- **WHEN** a user attempts to send `{"email": "new@test.com"}` in the PUT body
- **THEN** the system ignores the email field or returns 422 indicating email is not modifiable
- **THEN** the user's email remains unchanged

#### Scenario: Reject unauthenticated request
- **WHEN** an anonymous user sends `PUT /api/v1/perfil`
- **THEN** returns 401 Unauthorized

### Requirement: Change password (US-063)
The system SHALL provide `PUT /api/v1/perfil/password` for authenticated users to change their password. The request SHALL include `password_actual` and `password_nueva`. The system SHALL verify the current password with bcrypt.compare. The new password SHALL meet the same requirements as registration (minimum 8 characters). After successful change, the system SHALL revoke ALL refresh tokens for the user, forcing re-login on all devices.

#### Scenario: Successfully change password
- **WHEN** an authenticated user sends `PUT /api/v1/perfil/password` with valid `password_actual` and `password_nueva` (min 8 chars)
- **THEN** hashes new password with bcrypt (cost >= 10) and updates the user record
- **THEN** revokes all refresh tokens (sets revoked_at = now())
- **THEN** returns 200 with message "Contraseña actualizada"

#### Scenario: Incorrect current password
- **WHEN** an authenticated user sends `PUT /api/v1/perfil/password` with incorrect `password_actual`
- **THEN** returns 400 with error "Contraseña actual incorrecta"

#### Scenario: New password too short
- **WHEN** a user sends `password_nueva` with less than 8 characters
- **THEN** returns 422 validation error

#### Scenario: All sessions invalidated after change
- **WHEN** password change succeeds
- **THEN** all refresh tokens for the user have `revoked_at` set
- **THEN** user must re-login on all devices