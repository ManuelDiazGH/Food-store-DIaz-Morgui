# auth-foundation Specification

## Purpose
TBD - created by archiving change setup000. Update Purpose after archive.
## Requirements
### Requirement: JWT access token and refresh token authentication
The backend SHALL implement JWT-based authentication with short-lived access tokens (30 minutes) and long-lived refresh tokens (7 days) stored in the database.

#### Scenario: Login returns access and refresh tokens
- **WHEN** a user submits valid credentials (email and password) to POST /api/v1/auth/login
- **THEN** the system SHALL return a JWT access token (expires in 30 minutes, HS256 algorithm) and a refresh token (UUID v4, stored in database, expires in 7 days)

#### Scenario: Access token authenticates requests
- **WHEN** a request includes a valid JWT access token in the Authorization header (Bearer scheme)
- **THEN** the backend SHALL authenticate the user and make the user object available in the request context

#### Scenario: Expired access token returns 401
- **WHEN** a request includes an expired JWT access token
- **THEN** the backend SHALL return HTTP 401 (Unauthorized) with RFC 7807 error format

### Requirement: Refresh token rotation and revocation
The backend SHALL implement refresh token rotation (each refresh revokes the old token and issues a new one) and allow revocation on logout.

#### Scenario: Refresh token rotation
- **WHEN** a client sends a valid refresh token to POST /api/v1/auth/refresh
- **THEN** the system SHALL revoke the old refresh token (set revoked_at), generate a new refresh token (UUID v4, 7 days expiry), and return a new access token

#### Scenario: Logout revokes refresh token
- **WHEN** an authenticated user calls POST /api/v1/auth/logout
- **THEN** the system SHALL revoke the user's refresh token in the database and invalidate the current access token

#### Scenario: Revoked refresh token is rejected
- **WHEN** a client attempts to use a revoked refresh token
- **THEN** the backend SHALL return HTTP 401 (Unauthorized) and require re-authentication

### Requirement: Password hashing with Passlib and bcrypt
The backend SHALL hash passwords using Passlib with bcrypt algorithm and a cost factor of at least 12.

#### Scenario: Password hashing on user creation
- **WHEN** a new user is created or password is changed
- **THEN** the password SHALL be hashed using Passlib with bcrypt (cost ≥ 12) before storing in the database

#### Scenario: Password verification
- **WHEN** a user attempts to log in with a password
- **THEN** the system SHALL verify the provided password against the stored bcrypt hash using Passlib

### Requirement: RBAC with 4 roles assigned to users
The backend SHALL implement Role-Based Access Control (RBAC) with 4 roles (ADMIN, STOCK, PEDIDOS, CLIENT) assignable to users via a many-to-many relationship.

#### Scenario: User with role accesses protected endpoint
- **WHEN** an authenticated user with the required role accesses a protected endpoint
- **THEN** the system SHALL allow the request to proceed

#### Scenario: User without role is forbidden
- **WHEN** an authenticated user without the required role attempts to access a protected endpoint
- **THEN** the backend SHALL return HTTP 403 (Forbidden) with RFC 7807 error format

### Requirement: RFC 7807 error responses for auth failures
Authentication and authorization errors SHALL return RFC 7807 Problem Details format.

#### Scenario: Auth error uses RFC 7807
- **WHEN** an authentication or authorization error occurs (invalid credentials, expired token, insufficient permissions)
- **THEN** the backend SHALL return an RFC 7807 compliant JSON response with type, title, status, detail, and instance fields

