## 1. Backend Structure and Configuration

- [x] 1.1 Create backend directory structure with `backend/app/modules/` for all modules (auth, usuarios, categorias, productos, pedidos, pagos, direcciones, admin, refreshtokens, ingredientes)
- [x] 1.2 Initialize Python virtual environment in `backend/.venv/` and create `requirements.txt` with: fastapi>=0.111, sqlmodel>=0.0.19, uvicorn[standard], python-jose[cryptography], passlib[bcrypt], slowapi>=0.1.9, alembic>=1.13, psycopg2-binary, python-dotenv, mercadopago>=2.3.0
- [x] 1.3 Create `backend/app/main.py` with FastAPI application factory, configure CORSMiddleware (allow origins: http://localhost:5173), and register module routers
- [x] 1.4 Create `backend/app/core/config.py` with Pydantic Settings loading from .env (DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES=30, REFRESH_TOKEN_EXPIRE_DAYS=7), plus `database.py` (engine + session factory) and `security.py` (bcrypt hashing, JWT, UUID refresh tokens)
- [ ] 1.5 Create `backend/.env.example` with all required variables (DATABASE_URL, SECRET_KEY, etc.)

## 2. Database Setup with SQLModel and Alembic

- [x] 2.1 Create `backend/app/models/all_models.py` with all 16 SQLModel classes: Usuario, Rol, UsuarioRol, RefreshToken, DireccionEntrega, Categoria, Producto, Ingrediente, ProductoCategoria, ProductoIngrediente, EstadoPedido, Pedido, DetallePedido, HistorialEstadoPedido, FormaPago, Pago
- [x] 2.2 Configure SQLModel with PostgreSQL connection using DATABASE_URL from config (via `app.core.database`)
- [x] 2.3 Initialize Alembic in `backend/alembic/` with `alembic.ini` configured for SQLModel/SQLAlchemy
- [x] 2.4 Create `backend/alembic/env.py` configured to autogenerate migrations from SQLModel models — initial migration generated (1b0f96613ef5)
- [x] 2.5 Create `backend/app/db/seed.py` script that creates: 4 roles (ADMIN, STOCK, PEDIDOS, CLIENT), 6 order states (PENDIENTE, CONFIRMADO, EN_PREPARACION, EN_CAMINO, ENTREGADO, CANCELADO), 3 payment methods (MERCADOPAGO, RAPIPAGO, PAGOFACIL), and admin user (admin@foodstore.com / admin123)

## 3. BaseRepository[T] and Unit of Work Pattern

- [ ] 3.1 Create `backend/app/core/base_repository.py` with generic `BaseRepository[T]` class implementing: create(), get_by_id(), get_all(), update(), delete() with SQLModel session
- [ ] 3.2 Create `backend/app/core/uow.py` with `UnitOfWork` class that: manages database session, provides access to all repositories, automatically commits on success or rolls back on exception
- [ ] 3.3 Implement soft delete pattern: add `eliminado_en: datetime | None = Field(default=None)` field to entities that require it (Usuario, Producto, Categoria), and ensure queries filter `WHERE eliminado_en IS NULL` by default

## 4. Auth Foundation - JWT and Refresh Tokens

- [ ] 4.1 Create `backend/app/modules/auth/schemas.py` with Pydantic v2 schemas: LoginRequest, RegisterRequest (with EmailStr validation, password min 8 chars), TokenResponse (access_token, refresh_token, token_type, expires_in), UserResponse
- [ ] 4.2 Create `backend/app/modules/auth/service.py` with auth logic: verify_password() using Passlib with bcrypt (cost≥12), create_access_token() using python-jose HS256 (30 min expiry), create_refresh_token() generating UUID v4 stored in DB (7 days expiry)
- [ ] 4.3 Create `backend/app/modules/auth/router.py` with endpoints: POST /api/v1/auth/register, POST /api/v1/auth/login (with rate limiting decorator from slowapi: 5 attempts/15 min/IP), POST /api/v1/auth/refresh, POST /api/v1/auth/logout, GET /api/v1/auth/me
- [ ] 4.4 Create `backend/app/core/security.py` with FastAPI dependencies: get_current_user() validating JWT from Authorization header, require_role() dependency for RBAC checking user roles against required roles

## 5. Module Structure - Feature-First

- [ ] 5.1 Create `backend/app/modules/usuarios/` with: model.py (Usuario SQLModel with relationships), schemas.py (UsuarioCreate, UsuarioUpdate, UsuarioRead), repository.py (inherits BaseRepository[Usuario]), service.py (CRUD logic with UoW), router.py (GET, POST, PUT, DELETE endpoints with soft delete)
- [ ] 5.2 Create `backend/app/modules/categorias/` with: model.py (Categoria with parent_id self-reference for hierarchical categories), schemas.py, repository.py (with CTE recursive query support), service.py, router.py
- [ ] 5.3 Create `backend/app/modules/productos/` with: model.py (Producto with stock_cantidad, disponible, relationships to Categoria and Ingrediente), schemas.py, repository.py, service.py, router.py (including PATCH /{id}/disponibilidad for STOCK role)
- [ ] 5.4 Create `backend/app/modules/pedidos/` with: model.py (Pedido with FSM state machine, DetallePedido with snapshots, HistorialEstadoPedido append-only), schemas.py, repository.py, service.py (validate state transitions with RN-01, RN-02, RN-03), router.py
- [ ] 5.5 Create `backend/app/modules/pagos/` with: model.py (Pago with mp_payment_id, mp_status, external_reference, idempotency_key), schemas.py, service.py (MercadoPago integration), router.py (POST /crear, POST /webhook)
- [ ] 5.6 Create `backend/app/modules/direcciones/`, `backend/app/modules/refreshtokens/`, `backend/app/modules/admin/` with basic structure (model, schemas, repository, service, router)

## 6. Frontend Setup with Vite + React + TypeScript

- [ ] 6.1 Initialize Vite project in `frontend/` with React + TypeScript template: `npm create vite@latest frontend -- --template react-ts`
- [ ] 6.2 Install dependencies: `npm install tanstack-query tanstack-form zustand axios recharts tailwindcss postcss autoprefixer @mercadopago/sdk-react`
- [ ] 6.3 Configure Tailwind CSS: create `frontend/tailwind.config.js` and `frontend/postcss.config.js`, add Tailwind directives to `frontend/src/index.css`
- [ ] 6.4 Configure Vite: update `frontend/vite.config.ts` with proxy to backend (http://localhost:8000) for API requests
- [ ] 6.5 Create `frontend/.env.example` with VITE_API_URL=http://localhost:8000 and VITE_MP_PUBLIC_KEY

## 7. Frontend Architecture - Feature-Sliced Design

- [x] 7.1 Create FSD layers in `frontend/src/`: app/ (providers, routing, global styles), pages/ (one per route), widgets/ (composed UI blocks), features/ (auth, cart, checkout, admin features), entities/ (domain models + API), shared/ (generic UI, utils, config)
- [ ] 7.2 Setup TanStack Query: create `frontend/src/entities/api/queryClient.ts` with QueryClient configuration, add QueryClientProvider in `frontend/src/app/providers.tsx`
- [ ] 7.3 Setup Axios: create `frontend/src/entities/api/axios.ts` with interceptors that attach JWT from Zustand auth store, and handle 401 by calling refresh token endpoint
- [ ] 7.4 Setup Zustand stores: create `frontend/src/features/auth/store/authStore.ts` (user, tokens, login/logout actions), `frontend/src/features/cart/store/cartStore.ts` (cart items with localStorage persistence)
- [ ] 7.5 Define TypeScript types: create `frontend/src/entities/types/` with interfaces for Usuario, Producto, Pedido, etc. matching backend Pydantic schemas

## 8. Integration and Verification

- [ ] 8.1 Test backend startup: `cd backend && .venv/Scripts/activate && uvicorn app.main:app --reload` → verify http://localhost:8000/docs shows Swagger UI
- [ ] 8.2 Test database: run `alembic upgrade head` → verify tables created in PostgreSQL, run `python -m app.db.seed` → verify seed data inserted
- [ ] 8.3 Test auth flow: use Swagger UI to register user, login, get JWT, access /api/v1/auth/me with Bearer token
- [ ] 8.4 Test frontend startup: `cd frontend && npm run dev` → verify http://localhost:5173 loads with Vite + React
- [ ] 8.5 Verify CORS: make request from frontend to backend API, confirm CORS headers present
- [ ] 8.6 Verify rate limiting: attempt >5 failed logins from same IP within 15 min, confirm HTTP 429 response with RFC 7807 format
