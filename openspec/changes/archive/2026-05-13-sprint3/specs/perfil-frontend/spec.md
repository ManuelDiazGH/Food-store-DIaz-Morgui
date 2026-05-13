## ADDED Requirements

### Requirement: Profile view page (US-061)
The frontend SHALL display a profile page at `/perfil` showing the authenticated user's: nombre, email, telefono, fecha_registro. The page SHALL be accessible only to authenticated users. Email SHALL be displayed as read-only (no edit option). The page SHALL provide an "Editar perfil" button.

#### Scenario: View profile as authenticated user
- **WHEN** an authenticated user navigates to `/perfil`
- **THEN** page displays nombre, email (readonly), telefono, and registration date

#### Scenario: Redirect unauthenticated user
- **WHEN** an anonymous user navigates to `/perfil`
- **THEN** redirects to `/login`

### Requirement: Profile edit form (US-062)
The frontend SHALL provide an edit form for nombre and telefono fields. Email SHALL be displayed but not editable (greyed out or disabled). The form SHALL validate telefono format if provided. On successful save, a success toast SHALL be shown.

#### Scenario: Edit nombre and telefono
- **WHEN** user clicks "Editar perfil", modifies nombre and telefono, and submits
- **THEN** PUT /perfil is called with updated data
- **THEN** success toast "Perfil actualizado" appears

#### Scenario: Email is not editable
- **WHEN** user is in edit mode
- **THEN** email field is visible but disabled/greyed out with a tooltip "El email no se puede cambiar"

### Requirement: Password change form (US-063)
The frontend SHALL provide a password change form with three fields: contraseña actual, nueva contraseña, confirmar nueva contraseña. The form SHALL validate: minimum 8 characters for new password, new password matches confirmation. On successful change, the user SHALL be logged out and redirected to `/login` with a toast "Contraseña actualizada. Iniciá sesión nuevamente."

#### Scenario: Successfully change password
- **WHEN** user enters correct current password and valid new password (min 8 chars, matches confirmation)
- **THEN** PUT /perfil/password is called
- **THEN** authStore is cleared, user is redirected to /login with success toast

#### Scenario: Incorrect current password
- **WHEN** user enters incorrect current password
- **THEN** error toast "Contraseña actual incorrecta" appears

#### Scenario: New password too short
- **WHEN** user enters new password with less than 8 characters
- **THEN** inline validation error appears before submission

#### Scenario: Passwords don't match
- **WHEN** user enters a new password that doesn't match the confirmation
- **THEN** inline validation error "Las contraseñas no coinciden" appears