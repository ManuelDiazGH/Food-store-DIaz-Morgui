## ADDED Requirements

### Requirement: PostgreSQL database with SQLModel ORM
The backend SHALL connect to a PostgreSQL 15+ database using SQLModel as the ORM, with connection settings configured via environment variables.

#### Scenario: Database connection successful
- **WHEN** the backend starts with valid DATABASE_URL in .env
- **THEN** it SHALL establish a connection to PostgreSQL and be ready to execute queries via SQLModel

#### Scenario: SQLModel models define tables
- **WHEN** the backend imports SQLModel models (e.g., Usuario, Producto, Pedido)
- **THEN** the models SHALL be defined using SQLModel with proper fields, types, and relationships

### Requirement: Alembic migrations configured and functional
The backend SHALL use Alembic for versioned database migrations, with ability to generate migrations automatically from SQLModel changes.

#### Scenario: Alembic generates migration from model changes
- **WHEN** a developer runs `alembic revision --autogenerate -m "description"`
- **THEN** Alembic SHALL detect changes in SQLModel models and generate a migration script in `backend/alembic/versions/`

#### Scenario: Alembic applies migrations
- **WHEN** a developer runs `alembic upgrade head`
- **THEN** all pending migrations SHALL be applied to the database, creating or modifying tables as needed

### Requirement: Seed data script creates initial required data
The backend SHALL include a seed script (`app/db/seed.py`) that creates initial data required for the system to function: roles, order states, payment methods, and admin user.

#### Scenario: Seed creates roles
- **WHEN** the seed script runs
- **THEN** the database SHALL contain 4 roles: ADMIN, STOCK, PEDIDOS, CLIENT in the roles table

#### Scenario: Seed creates order states
- **WHEN** the seed script runs
- **THEN** the database SHALL contain 6 order states: PENDIENTE, CONFIRMADO, EN_PREPARACION, EN_CAMINO, ENTREGADO, CANCELADO in the estados_pedido table

#### Scenario: Seed creates payment methods
- **WHEN** the seed script runs
- **THEN** the database SHALL contain payment methods: mercadopago, rapipago, pagofacil in the formas_pago table

#### Scenario: Seed creates admin user
- **WHEN** the seed script runs
- **THEN** the database SHALL contain an admin user with email "admin@foodstore.com", password hash for "admin123", and ADMIN role assigned

### Requirement: Soft delete pattern with eliminado_en field
Entities that require soft delete SHALL include an `eliminado_en` field (TIMESTAMPTZ or nullable timestamp) instead of physical DELETE.

#### Scenario: Soft delete marks entity
- **WHEN** a delete operation is performed on a soft-deletable entity (e.g., Producto, Usuario)
- **THEN** the system SHALL set `eliminado_en` to the current timestamp instead of deleting the row from the database

#### Scenario: Queries exclude soft-deleted entities
- **WHEN** querying soft-deletable entities
- **THEN** the query SHALL filter out rows where `eliminado_en` IS NOT NULL by default
