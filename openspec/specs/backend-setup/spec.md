# backend-setup Specification

## Purpose
TBD - created by archiving change setup000. Update Purpose after archive.
## Requirements
### Requirement: Backend project structure with feature-first modules
The backend SHALL follow a feature-first architecture where each module (auth, usuarios, categorias, productos, pedidos, pagos, direcciones, admin, refreshtokens) has its own folder containing model.py, schemas.py, repository.py, service.py, and router.py.

#### Scenario: Verify backend module structure exists
- **WHEN** the backend is set up
- **THEN** the directory `backend/app/modules/` SHALL contain folders for each module: auth, usuarios, categorias, productos, pedidos, pagos, direcciones, admin, refreshtokens

#### Scenario: Each module contains required files
- **WHEN** inspecting any module folder (e.g., `backend/app/modules/auth/`)
- **THEN** it SHALL contain at minimum: model.py, schemas.py, repository.py, service.py, router.py

### Requirement: FastAPI application factory pattern
The backend SHALL use FastAPI with an application factory pattern, allowing middleware (CORS, rate limiting) to be configured centrally.

#### Scenario: FastAPI app initializes correctly
- **WHEN** the backend starts
- **THEN** it SHALL create a FastAPI instance with title "Food Store", OpenAPI docs at /docs and /redoc, and register all module routers

#### Scenario: CORS configured correctly
- **WHEN** a request comes from the frontend origin (http://localhost:5173)
- **THEN** the backend SHALL respond with appropriate CORS headers allowing the request

### Requirement: BaseRepository[T] generic CRUD implementation
The backend SHALL implement a generic `BaseRepository[T]` class providing common CRUD operations (create, read, update, delete) that can be inherited by specific repositories.

#### Scenario: BaseRepository provides CRUD operations
- **WHEN** a new repository inherits from `BaseRepository[Model]`
- **THEN** it SHALL have access to methods: create(), get_by_id(), get_all(), update(), delete() without reimplementing them

### Requirement: Unit of Work pattern for transactional operations
The backend SHALL implement a Unit of Work (UoW) pattern that manages database transactions atomically, providing access to repositories and handling commit/rollback automatically.

#### Scenario: UoW handles transaction commit
- **WHEN** a service method completes without exceptions inside a UoW context
- **THEN** the UoW SHALL commit the transaction automatically

#### Scenario: UoW handles transaction rollback
- **WHEN** a service method raises an exception inside a UoW context
- **THEN** the UoW SHALL rollback the transaction automatically and the exception SHALL propagate

### Requirement: Rate limiting on authentication endpoints
The backend SHALL implement rate limiting on the login endpoint using slowapi, limiting to 5 failed attempts per 15 minutes per IP address.

#### Scenario: Rate limit enforces on login
- **WHEN** a client makes more than 5 POST requests to /api/v1/auth/login from the same IP within 15 minutes
- **THEN** the backend SHALL return HTTP 429 (Too Many Requests) with RFC 7807 error format

