# Progreso del Proyecto — Food Store E-Commerce

> **Actualizado**: 2026-05-12  
> **Épica activa**: 01 — Auth y Navegación (Sprint 1)  
> **Setup000**: ✅ 38/39 tareas completadas (solo faltan pruebas E2E con PostgreSQL)  
> **Sprint 0**: ✅ CERRADO  
> **Sprint 1**: ✅ COMPLETADO

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completado |
| 🔲 | Pendiente |
| 🔄 | En progreso |

---

## Estado General

| Componente | Estado | Último cambio |
|-----------|--------|---------------|
| Documentación (`docs/`) | ✅ Completa | Commit inicial |
| Infraestructura OPSX (`openspec/`) | ✅ Configurada | Commit inicial |
| Skills de agente (`.opencode/`, `.cursor/`, `.claude/`) | ✅ Configuradas | Commit inicial |
| **Backend: Estructura base** | ✅ **Completada** | US-000 |
| **Frontend: Estructura FSD** | ✅ **Completada** | US-000 |
| **Backend: Models SQLModel + DB** | ✅ **Completada** | US-000b |
| **Backend: Config FastAPI + CORS** | ✅ **Completada** | US-000a |
| Backend: Auth JWT (utilidades base) | ✅ Stubs + utils | US-000a |
| **Backend: Modelos + DB + Migraciones** | ✅ **Completada** | US-000b |
| **Backend: Patrones base (BaseRepository, UoW, Soft Delete)** | ✅ **Completada** | US-000d |
| **Backend: Auth Foundation (JWT, RBAC)** | ✅ **Completada** | US-000d |
| **Backend: Módulos funcionales (10 módulos)** | ✅ **Completada** | US-000f |
| **Frontend: Setup (Vite + React + TS + Tailwind)** | ✅ **Completada** | US-000c |
| **Frontend: Architecture (TanStack Query, Axios, Zustand)** | ✅ **Completada** | US-000e |
| Frontend: Componentes UI (Sprint 1) | ✅ Completada | US-075, US-076 |
| Frontend: Auth pages (Sprint 1) | ✅ Completada | US-001, US-002, US-004 |
| Frontend: RBAC Admin (Sprint 1) | ✅ Completada | US-005 |
| Frontend: Error handling + Toast (Sprint 1) | ✅ Completada | US-067, US-073 |
| Frontend: Routing + Guards (Sprint 1) | ✅ Completada | US-006, US-076 |
| Integration and Verification | 🔲 Pendiente | — |

---

## Historias de Usuario Implementadas

### US-000 — Inicialización del repositorio y estructura del proyecto ✅

**Estado**: Completada  
**Commits**:
- `d208cff` — feat(backend): add module stubs for feature-first structure
- `a88fa5e` — feat(frontend): add FSD directory structure (pages, widgets, shared)

**Criterios de aceptación cumplidos**:

| Criterio | Resultado |
|----------|-----------|
| Monorepo con `/backend` y `/frontend` | ✅ Existente |
| Backend: 10 módulos feature-first con stubs | ✅ 60 archivos creados |
| Frontend: FSD con app/pages/widgets/features/entities/shared | ✅ Capas completas |
| `.gitignore` con excludes necesarios | ✅ Existente |
| `README.md` con instrucciones de setup | ✅ Existente |
| `.env.example` en backend y frontend | ✅ Existente |
| Commits progresivos en Git | ✅ 2 commits |

**Creaciones**:
- `backend/app/__init__.py` — paquete raíz
- `backend/app/core/__init__.py` — paquete core
- `backend/app/db/__init__.py` — paquete db
- `backend/app/models/__init__.py` — paquete models
- `backend/app/modules/{auth,usuarios,productos,categorias,ingredientes,pedidos,pagos,direcciones,admin,refreshtokens}/` — 10 módulos con stubs
- `frontend/src/pages/` — capa de páginas
- `frontend/src/widgets/` — capa de widgets
- `frontend/src/shared/{ui,utils,config}/` — capa compartida

---

### US-000a — Configuración del entorno backend (FastAPI + dependencias) ✅

**Estado**: Completada  
**Commits**:
- `f17aba4` — feat(backend): add FastAPI core infrastructure

**Criterios de aceptación cumplidos**:

| Criterio | Resultado |
|----------|-----------|
| `pip install -r requirements.txt` instala todas las dependencias | ✅ 50 paquetes instalados |
| `uvicorn app.main:app --reload` arranca en puerto 8000 | ✅ Server start OK |
| Swagger en `/docs` y ReDoc en `/redoc` | ✅ 200 OK |
| `main.py` con CORS, rate limiting, routers `/api/v1` | ✅ Creado y verificado |
| `core/` con `config.py`, `database.py`, `security.py` | ✅ Creados |
| CORS permite `http://localhost:5173` | ✅ Configurado desde variable de entorno |

**Creaciones**:
- `backend/requirements.txt` — 50 dependencias Python instaladas
- `backend/.venv/` — entorno virtual Python 3.13
- `backend/app/main.py` — FastAPI factory con CORS, rate limiting, RFC 7807, 10 routers registrados
- `backend/app/core/config.py` — Pydantic Settings (DATABASE_URL, SECRET_KEY, JWT expiraciones, CORS, MP keys)
- `backend/app/core/database.py` — SQLAlchemy engine + session factory (pool_size=5, max_overflow=10)
- `backend/app/core/security.py` — bcrypt hashing (cost=12), JWT HS256, UUID refresh tokens

---

### US-000b — Configuración de PostgreSQL, migraciones y seed data ✅

**Estado**: Completada  
**Commits**:
- `28c3a01` — feat(backend): add 16 SQLModel entities + Alembic migrations + seed data

**Criterios de aceptación cumplidos**:

| Criterio | Resultado |
|----------|-----------|
| `alembic upgrade head` crea las 16 tablas del ERD v5 | ✅ Migración generada con 16 tablas |
| Campos de auditoría (creado_en, actualizado_en) | ✅ En todas las tablas principales |
| Soft delete (eliminado_en timestamp nullable) | ✅ En Usuario, Producto, Categoria, Ingrediente, DireccionEntrega |
| Tipos correctos: DECIMAL, INTEGER[], email UNIQUE | ✅ Precios NUMERIC(10,2), personalización INTEGER[] |
| FK y restricciones de integridad | ✅ ForeignKeyConstraints con ON DELETE SET NULL |
| Categoria.padre_id FK autoreferencial nullable | ✅ Definido con ondelete="SET NULL" |
| UsuarioRol UNIQUE compuesta (usuario_id, rol_codigo) | ✅ PK compuesta |
| Seed: 4 Roles, 6 Estados, Formas de pago, Admin | ✅ Script idempotente con ON CONFLICT DO NOTHING |
| Migraciones reversibles | ✅ `downgrade()` incluida en la migración |
| Seed idempotente | ✅ Verifica existencia antes de INSERT |

**Creaciones**:
- `backend/app/models/all_models.py` — 16 modelos SQLModel con 336 líneas
- `backend/alembic.ini` — Configuración de Alembic
- `backend/alembic/env.py` — Entorno con autogenerate + conexión desde Settings
- `backend/alembic/versions/1b0f96613ef5_initial.py` — Migración inicial
- `backend/app/db/seed.py` — Seed idempotente

---

### US-000c — Configuración del frontend (Vite + React + TypeScript + Tailwind) ✅

**Estado**: Completada  

**Criterios de aceptación cumplidos**:

| Criterio | Resultado |
|----------|-----------|
| Vite + React + TypeScript inicializado en `frontend/` | ✅ `npm create vite` con template react-ts |
| Dependencias instaladas (TanStack Query, Form, Zustand, Axios, Recharts, MP SDK) | ✅ 352 paquetes instalados |
| Tailwind CSS configurado con `tailwind.config.js` + `postcss.config.js` | ✅ Directivas Tailwind en `index.css` |
| Vite proxy configurado para `/api` → `http://localhost:8000` | ✅ Proxy en `vite.config.ts` |
| `.env.example` con `VITE_API_URL` y `VITE_MP_PUBLIC_KEY` | ✅ Existente |
| `npm run build` compila correctamente | ✅ 80 módulos, 171KB JS |

**Creaciones**:
- `frontend/package.json` — Dependencias: React 18, TypeScript 5, Vite 5, TanStack Query/Form, Zustand, Axios, Recharts, MP SDK, Tailwind
- `frontend/tsconfig.json` — TypeScript strict mode con path aliases (@app, @pages, @widgets, etc.)
- `frontend/vite.config.ts` — Vite config con React plugin, path aliases y API proxy
- `frontend/tailwind.config.js` — Tailwind con scan de `./src/**/*.{js,ts,jsx,tsx}`
- `frontend/postcss.config.js` — PostCSS con Tailwind y Autoprefixer
- `frontend/index.html` — HTML entry point
- `frontend/src/main.tsx` — React DOM render con AppProviders (QueryClientProvider)
- `frontend/src/App.tsx` — Componente raíz con placeholder Tailwind
- `frontend/src/index.css` — Estilos base con directivas Tailwind
- `frontend/src/vite-env.d.ts` — Tipos de Vite
- `frontend/.gitignore` — Excludes para node_modules, dist, .env

**Estructura FSD creada**:
- `src/app/` — Providers (AppProviders con QueryClientProvider)
- `src/entities/api/` — Axios instance + QueryClient config
- `src/entities/types/` — TypeScript interfaces (Usuario, Producto, Pedido, etc.)
- `src/features/auth/store/` — authStore (Zustand + persist)
- `src/features/cart/store/` — cartStore (Zustand + persist)
- `src/pages/`, `src/widgets/`, `src/shared/` — .gitkeep placeholders

---

### US-000d — Patrones base y Auth Foundation ✅

**Estado**: Completada  

**Criterios de aceptación cumplidos**:

| Criterio | Resultado |
|----------|-----------|
| BaseRepository[T] genérico con CRUD + soft delete | ✅ `base_repository.py` con create, get_by_id, get_all, update, delete, hard_delete |
| Soft delete automático en `get_all()` para modelos con `eliminado_en` | ✅ `hasattr(model, 'eliminado_en')` filtra WHERE eliminado_en IS NULL |
| UnitOfWork con commit/rollback automático | ✅ `uow.py` con context manager y lazy imports para evitar circular imports |
| UoW provee acceso a 15+ repositorios por propiedad | ✅ usuarios, usuario_roles, roles, categorias, productos, ingredientes, pedidos, detalles_pedido, historial_estados, estados_pedido, pagos, formas_pago, direcciones, refreshtokens, auth |
| Auth schemas (Register, Login, Refresh, Token, User) | ✅ Pydantic v2 con EmailStr, Field validators |
| AuthService con register, login, refresh, logout, me | ✅ Cumple RN-AU01 a RN-AU08 |
| Auth router con rate limiting (5/15min) | ✅ `@limiter.limit("5/15minutes")` en POST /login |
| Refresh token con rotación (RN-AU04) y detección de replay (RN-AU05) | ✅ Revoke + create nuevo token + family_id |
| RBAC con `get_current_user()` y `require_role()` | ✅ `dependencies.py` con FastAPI Depends |
| `.env.example` actualizado con ADMIN_EMAIL y ADMIN_PASSWORD | ✅ 9 variables documentadas |

**Creaciones**:
- `backend/app/core/base_repository.py` — BaseRepository[T] genérico (146 líneas)
  - `create()`, `get_by_id()`, `get_all()` con soft delete automático, `update()`, `delete()` (soft), `hard_delete()`
- `backend/app/core/uow.py` — UnitOfWork (119 líneas)
  - Context manager (`with UnitOfWork() as uow:`), auto-commit/rollback
  - 15+ repositorios lazy-loaded como propiedades
- `backend/app/core/dependencies.py` — FastAPI dependencies (74 líneas)
  - `get_current_user()` — Extrae JWT del header Authorization
  - `require_role(*roles)` — Factory RBAC checker
- `backend/app/modules/auth/schemas.py` — Pydantic v2 schemas (51 líneas)
  - `RegisterRequest`, `LoginRequest`, `RefreshRequest`, `TokenResponse`, `UserResponse`, `RefreshTokenResponse`
- `backend/app/modules/auth/service.py` — AuthService (177 líneas)
  - `register()` — Crea usuario + asigna rol CLIENT (RN-AU07)
  - `login()` — Verifica credenciales sin revelar existencia (RN-AU08)
  - `refresh()` — Rotación de tokens con detección de replay (RN-AU04, AU05)
  - `logout()` — Revoca refresh token
  - `get_current_user()` — Carga usuario desde BD
- `backend/app/modules/auth/router.py` — Auth endpoints (97 líneas)
  - `POST /api/v1/auth/register` — Registro con asignación automática de rol
  - `POST /api/v1/auth/login` — Login con rate limiting 5/15min
  - `POST /api/v1/auth/refresh` — Renovación con rotación
  - `POST /api/v1/auth/logout` — Revocación de refresh token
  - `GET /api/v1/auth/me` — Datos del usuario autenticado

**Repositorios implementados** (cada módulo):

| Módulo | Repository | Métodos específicos |
|--------|-----------|---------------------|
| usuarios | `UsuarioRepository`, `UsuarioRolRepository` | `get_by_email()`, `get_active_by_email()` |
| categorias | `CategoriaRepository`, `RolRepository` | `get_by_nombre()`, `get_subcategorias()` |
| productos | `ProductoRepository` | `get_by_nombre()`, `get_disponibles()` |
| pedidos | `PedidoRepository`, `DetallePedidoRepository`, `HistorialEstadoPedidoRepository`, `EstadoPedidoRepository` | `get_by_usuario()` |
| ingredientes | `IngredienteRepository` | `get_by_nombre()`, `get_alergenos()` |
| pagos | `PagoRepository`, `FormaPagoRepository` | `get_by_pedido_id()`, `get_by_external_reference()`, `get_by_idempotency_key()` |
| direcciones | `DireccionEntregaRepository` | `get_by_usuario()`, `get_principal()` |
| refreshtokens | `RefreshTokenRepository` | `get_by_token_hash()`, `revoke_token()`, `revoke_all_for_user()` |
| admin | `AdminRepository` | Hereda de BaseRepository[Pedido] |
| auth | `AuthRepository` | `get_active_by_email()` |

---

### US-000e — Frontend Architecture (TanStack Query, Axios, Zustand, Types) ✅

**Estado**: Completada  

**Criterios de aceptación cumplidos**:

| Criterio | Resultado |
|----------|-----------|
| TanStack Query configurado con QueryClient | ✅ `queryClient.ts` con staleTime 5min, gcTime 10min |
| QueryClientProvider en AppProviders | ✅ `providers.tsx` envuelve la app |
| Axios con interceptor JWT + refresh token automático | ✅ `axios.ts` con request/response interceptors |
| Refresh token automático en 401 con cola de requests | ✅ Interceptor con failedQueue pattern |
| Zustand authStore con persist en localStorage | ✅ accessToken, refreshToken, user, isAuthenticated |
| Zustand cartStore con persist en localStorage | ✅ items, addItem, removeItem, updateQuantity, clearCart, toggleCart |
| TypeScript types matching backend Pydantic schemas | ✅ 25+ interfaces: Usuario, Producto, Pedido, DetallePedido, etc. |

**Creaciones**:
- `frontend/src/entities/api/queryClient.ts` — QueryClient config (staleTime 5min, gcTime 10min)
- `frontend/src/entities/api/axios.ts` — Axios instance con:
  - Request interceptor: adjunta JWT del authStore
  - Response interceptor: maneja 401 → refresh automático con cola de requests pendientes
- `frontend/src/entities/types/index.ts` — TypeScript interfaces:
  - Auth: `LoginRequest`, `RegisterRequest`, `TokenResponse`, `UserResponse`
  - Domain: `Usuario`, `Categoria`, `Producto`, `ProductoCategoria`, `ProductoIngrediente`
  - Pedidos: `Pedido`, `DetallePedido`, `HistorialEstadoPedido`, `EstadoPedidoCodigo`
  - Direcciones: `DireccionEntrega`
  - Pagos: `Pago`, `FormaPago`
  - Roles: `RolCodigo`
- `frontend/src/features/auth/store/authStore.ts` — Zustand store con:
  - State: `accessToken`, `refreshToken`, `user`, `isAuthenticated`
  - Actions: `setTokens()`, `setUser()`, `clearAuth()`
  - Persist: localStorage con key `auth-storage`
- `frontend/src/features/cart/store/cartStore.ts` — Zustand store con:
  - State: `items`, `isOpen`
  - Computed: `totalItems()`, `totalPrice()`
  - Actions: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `toggleCart()`
  - Persist: localStorage con key `cart-storage`
- `frontend/src/app/providers.tsx` — AppProviders con QueryClientProvider

---

### US-000f — Módulos funcionales (Feature-First CRUD) ✅

**Estado**: Completada  

**Módulos implementados con schemas + service + router completos**:

#### Módulo: Usuarios
- **schemas.py**: `UsuarioCreate` (nombre, email EmailStr, password min 8, telefono), `UsuarioUpdate` (partial), `UsuarioRead` (con roles), `UsuarioRolCreate`
- **service.py**: `UsuarioService` — create, get_by_id, get_all, update, delete (soft), assign_role
- **router.py**: `GET /api/v1/usuarios` (list), `GET /{id}`, `POST /` (ADMIN), `PUT /{id}` (ADMIN o propio usuario), `DELETE /{id}` (ADMIN), `POST /{id}/roles` (ADMIN)

#### Módulo: Categorías
- **schemas.py**: `CategoriaCreate` (nombre, descripcion, padre_id), `CategoriaUpdate`, `CategoriaRead`
- **service.py**: `CategoriaService` — create (valida nombre único), get_by_id, get_all, get_subcategorias, update, delete (valida sin productos)
- **router.py**: `GET /api/v1/categorias` (list), `GET /{id}`, `GET /{id}/subcategorias`, `POST /` (ADMIN), `PUT /{id}` (ADMIN), `DELETE /{id}` (ADMIN)

#### Módulo: Productos
- **schemas.py**: `ProductoCreate` (nombre, descripcion, precio_base Decimal>0, stock_cantidad≥0, disponible, imagen), `ProductoUpdate`, `ProductoRead`
- **service.py**: `ProductoService` — create, get_by_id, get_all, get_disponibles, update, toggle_disponibilidad (STOCK role), delete
- **router.py**: `GET /api/v1/productos` (?disponible=true filter), `GET /{id}`, `POST /` (ADMIN/STOCK), `PUT /{id}` (ADMIN/STOCK), `PATCH /{id}/disponibilidad` (STOCK/ADMIN), `DELETE /{id}` (ADMIN)

#### Módulo: Pedidos (FSM)
- **schemas.py**: `CrearPedidoRequest` (forma_pago_codigo, direccion_id, notas, items[]), `DetalleItem`, `EstadoUpdateRequest`, `PedidoRead` (con detalles + historial)
- **service.py**: `PedidoService` — create (valida stock, calcula total con snapshots), transicionar_estado (valida FSM)
  - **FSM válida**: PENDIENTE → CONFIRMADO → EN_PREPARACION → EN_CAMINO → ENTREGADO (terminal)
  - **Rama cancelación**: CONFIRMADO → CANCELADO (terminal)
  - **Audit trail**: HistorialEstadoPedido append-only con cada transición
  - **Costo de envío**: $50.00 fijo
- **router.py**: `GET /api/v1/pedidos` (?usuario_id filter), `GET /{id}`, `POST /` (auth required), `PATCH /{id}/estado`

#### Módulo: Pagos
- **schemas.py**: `CrearPagoRequest` (pedido_id, forma_pago_codigo), `PagoRead`, `WebhookMPRequest`
- **service.py**: `PagoService` — crear_pago (genera idempotency_key + external_reference), process_webhook (MP IPN)
- **router.py**: `POST /api/v1/pagos/crear`, `POST /api/v1/pagos/webhook`, `GET /api/v1/pagos/pedido/{pedido_id}`

#### Módulo: Direcciones
- **schemas.py**: `DireccionCreate` (alias, linea1, linea2, ciudad, cp, es_principal), `DireccionUpdate`, `DireccionRead`
- **service.py**: `DireccionService` — create (desactiva principal anterior), get_by_id, get_by_usuario, update, set_principal, delete
- **router.py**: `GET /api/v1/direcciones/usuario/{usuario_id}`, `GET /{id}`, `POST /`, `PUT /{id}`, `PATCH /{id}/principal`, `DELETE /{id}`

#### Módulo: Refreshtokens
- **schemas.py**: `RefreshTokenRead` (minimal)
- **service.py**: `RefreshTokenService` — revoke_all_for_user (admin)
- **router.py**: `DELETE /api/v1/refreshtokens/user/{usuario_id}` (ADMIN only)

#### Módulo: Admin
- **schemas.py**: `DashboardStats` (total_usuarios, total_pedidos, total_productos, productos_disponibles, pedidos_pendientes, pedidos_entregados)
- **service.py**: `AdminService` — get_dashboard_stats (SQLAlchemy func.count queries)
- **router.py**: `GET /api/v1/admin/dashboard` (ADMIN only)

#### Módulo: Ingredientes
- **repository.py**: `IngredienteRepository` — get_by_nombre(), get_alergenos()
- *(Schemas, service y router pendientes de implementación completa)*

---

## OPSX Changes

### `setup000` — Sprint 0: Infraestructura Base 🔄

**Artefactos**: Proposal ✅ Design ✅ Specs ✅ Tasks (35/39 completadas)  

| Bloque | Progreso |
|--------|----------|
| 1. Backend Structure and Configuration | ✅ 5/5 tareas |
| 2. Database Setup with SQLModel + Alembic | ✅ 5/5 tareas |
| 3. BaseRepository[T] and Unit of Work | ✅ 3/3 tareas |
| 4. Auth Foundation — JWT and Refresh Tokens | ✅ 4/4 tareas |
| 5. Module Structure — Feature-First | ✅ 6/6 tareas |
| 6. Frontend Setup (Vite + React + TS) | ✅ 5/5 tareas |
| 7. Frontend Architecture — FSD | ✅ 5/5 tareas |
| 8. Integration and Verification | 🔄 5/6 (8.2 y 8.3 requieren PostgreSQL) |

---

## Estructura Actual del Proyecto

```
food-store/
├── backend/                              ← FastAPI + SQLModel
│   ├── .env.example                      ← Variables de entorno (9 vars)
│   ├── alembic.ini                       ← Config migraciones
│   ├── alembic/                          ← Migraciones versionadas
│   ├── requirements.txt                  ← 50 dependencias
│   └── app/
│       ├── __init__.py
│       ├── main.py                       ← FastAPI factory (43 rutas)
│       ├── core/
│       │   ├── config.py                 ← Pydantic Settings
│       │   ├── database.py               ← SQLAlchemy engine + session
│       │   ├── security.py               ← bcrypt, JWT, UUID refresh
│       │   ├── base_repository.py        ← BaseRepository[T] genérico
│       │   ├── uow.py                    ← UnitOfWork (15 repos)
│       │   └── dependencies.py           ← get_current_user, require_role RBAC
│       ├── db/
│       │   └── seed.py                   ← Seed idempotente
│       ├── models/
│       │   ├── __init__.py
│       │   └── all_models.py             ← 16 modelos SQLModel
│       └── modules/
│           ├── admin/                    ← Dashboard stats (schema+service+router)
│           ├── auth/                     ← JWT auth completo (5 endpoints)
│           ├── categorias/               ← CRUD jerárquico
│           ├── direcciones/              ← CRUD + dirección principal
│           ├── ingredientes/             ← Repository (service/router pendiente)
│           ├── pagos/                    ← MP integration + webhook
│           ├── pedidos/                  ← FSM + audit trail + snapshots
│           ├── productos/                ← CRUD + toggle disponibilidad
│           ├── refreshtokens/            ← Admin revocation
│           └── usuarios/                ← CRUD + RBAC + soft delete
├── frontend/                             ← React + Vite + TypeScript
│   ├── package.json                     ← 352 paquetes instalados
│   ├── tsconfig.json                    ← Strict mode + path aliases
│   ├── vite.config.ts                   ← React plugin + proxy + aliases
│   ├── tailwind.config.js               ← Tailwind scan config
│   ├── postcss.config.js                ← PostCSS + Autoprefixer
│   ├── index.html                       ← Entry point
│   ├── .gitignore
│   └── src/
│       ├── main.tsx                     ← React DOM + AppProviders
│       ├── App.tsx                      ← Root component
│       ├── index.css                    ← Tailwind directives
│       ├── vite-env.d.ts
│       ├── app/
│       │   └── providers.tsx            ← QueryClientProvider
│       ├── entities/
│       │   ├── api/
│       │   │   ├── queryClient.ts       ← TanStack Query config
│       │   │   └── axios.ts             ← JWT interceptor + refresh queue
│       │   └── types/
│       │       └── index.ts            ← 25+ TS interfaces
│       ├── features/
│       │   ├── auth/store/
│       │   │   └── authStore.ts         ← Zustand + persist
│       │   └── cart/store/
│       │       └── cartStore.ts         ← Zustand + persist
│       ├── pages/                        ← .gitkeep
│       ├── widgets/                      ← .gitkeep
│       ├── shared/
│       │   ├── config/                  ← .gitkeep
│       │   ├── ui/                      ← .gitkeep
│       │   └── utils/                   ← .gitkeep
│       └── assets/                      ← .gitkeep
├── docs/
│   ├── CHANGES.md
│   ├── Descripcion.txt
│   ├── Historias_de_usuario.txt
│   ├── Integrador.txt
│   └── PROGRESO.md                      ← Este archivo
├── openspec/
│   ├── changes/setup000/
│   └── specs/
├── AGENTS.md
└── README.md
```

---

## Próximos Pasos (Sprint 1+)

1. ✅ ~~US-000a — Configuración del backend FastAPI~~
2. ✅ ~~US-000b — Modelos SQLModel, migraciones Alembic y seed data~~
3. ✅ ~~US-000c — Frontend Setup (Vite, React, TS, Tailwind)~~
4. ✅ ~~US-000d — Patrones base (BaseRepository, UoW, dependencies RBAC)~~
5. ✅ ~~US-000d — Auth Foundation (JWT, RBAC, refresh tokens)~~
6. ✅ ~~US-000e — Frontend Architecture (TanStack Query, Axios, Zustand)~~
7. ✅ ~~US-000f — Módulos funcionales (10 módulos con CRUD + FSM)~~
8. ✅ ~~Integration check: 48 API routes, all imports OK, bcrypt+JWT OK, frontend build OK~~
9. ✅ ~~Ingrediente module completo (schemas + service + router)~~
10. ✅ **Pruebas E2E con PostgreSQL** — alembic upgrade head, seed, auth flow
    - PostgreSQL 16 (Homebrew) en localhost:5432, database `foodstore`, user `postgres`
    - 17 tablas creadas con Alembic migration
    - Seed: 4 Roles, 6 Estados, 3 Formas de pago, 1 Admin user
    - E2E tests passed: register, login, refresh, me, logout, RBAC (403), duplicate (409), wrong password (401)
    - Bug fix: DetachedInstanceError → all Relationship fields use `lazy="selectin"` + `expire_on_commit=False`
    - Bug fix: UsuarioRead schema → `from_usuario()` helper para extraer roles como strings
11. ✅ **Sprint 1** — Auth y Navegación completado

---

## Sprint 1 — Auth y Navegación ✅

**Estado**: Completado  
**Commits**: Pendiente

### Historias de usuario implementadas

| Historia | Nombre | Estado |
|----------|--------|--------|
| US-001 | Registro de cliente | ✅ RegisterForm + RegisterPage |
| US-002 | Login de usuario | ✅ LoginForm + LoginPage + rate limiting 429 |
| US-003 | Refresh de token | ✅ Axios interceptor con refresh queue (ya existía, verificado) |
| US-004 | Logout | ✅ Navbar logout button + useLogout mutation |
| US-005 | Gestión de roles (RBAC) | ✅ AdminUsersPage + AssignRoleDialog + RoleBadge |
| US-006 | Protección de rutas por rol | ✅ ProtectedRoute + RoleGuard + RBAC dependencies |
| US-066 | Token expirado | ✅ Axios interceptor con refresh automático + cola de requests (ya existía) |
| US-067 | Errores global frontend | ✅ Toast system + ErrorBoundary + errorHandler + api-error events |
| US-073 | Rate limiting feedback | ✅ 429 handling en LoginForm + toast via api-error events |
| US-075 | Navegación por rol | ✅ Navbar responsive con menú por rol (CLIENT, STOCK, PEDIDOS, ADMIN, público) |
| US-076 | Protección rutas frontend | ✅ React Router guards + redirect a /login + RoleGuard 403 |

### Archivos creados/modificados

**Infraestructura Frontend:**
- `frontend/src/app/router.tsx` — createBrowserRouter con rutas públicas, protegidas y por rol
- `frontend/src/app/Layout.tsx` — Layout con Navbar + Outlet + Footer
- `frontend/src/app/providers.tsx` — QueryClientProvider + ToastProvider + ApiErrorListener
- `frontend/src/app/error-boundary.tsx` — ErrorBoundary global con retry
- `frontend/src/App.tsx` — RouterProvider + ErrorBoundary + AppProviders

**UI Components (`shared/ui/`):**
- `Button.tsx` — primary/secondary/danger, sizes, loading, fullWidth
- `Input.tsx` — label, error, icon, types
- `Spinner.tsx` — sm/md/lg, orange/white/gray
- `Toast.tsx` — Toast + ToastProvider + useToast + ApiErrorListener

**Auth (`features/auth/`):**
- `components/LoginForm.tsx` — formulario completo con validación y manejo de errores
- `components/RegisterForm.tsx` — formulario con nombre/email/password/confirm/teléfono
- `guards/ProtectedRoute.tsx` — verifica isAuthenticated, redirect a /login con ?redirect
- `guards/RoleGuard.tsx` — verifica roles, muestra 403 o renderiza children/outlet

**API (`entities/api/`):**
- `authApi.ts` — useLogin, useRegister, useLogout, useMe (TanStack Query mutations/queries)
- `userApi.ts` — useUsers, useUser, useUpdateUser, useDeleteUser, useAssignRole
- `axios.ts` — actualizado con dispatchApiError para 403/404/429/500

**Admin (`features/admin/`):**
- `hooks/useUserMutations.ts` — useAssignRole, useRemoveUser
- `components/RoleBadge.tsx` — badges por color de rol (ADMIN=red, STOCK=blue, etc.)
- `components/AssignRoleDialog.tsx` — modal para asignar roles

**Pages (`pages/`):**
- `auth/LoginPage.tsx` — página de login con LoginForm
- `auth/RegisterPage.tsx` — página de registro con RegisterForm
- `HomePage.tsx` — landing con hero + categorías placeholder
- `DashboardPage.tsx` — dashboard con bienvenida + cards placeholder
- `NotFoundPage.tsx` — 404
- `ForbiddenPage.tsx` — 403
- `admin/AdminUsersPage.tsx` — tabla completa con búsqueda, paginación, asignar roles, eliminar
- `admin/AdminDashboardPage.tsx` — placeholder
- + placeholders para Profile, Cart, Orders, Addresses, Products, Categories, Ingredients, Stock, OrdersPanel

**Navbar (`widgets/Navbar/`):**
- `Navbar.tsx` — responsive con menú por rol, logout, hamburger mobile
- `NavItem.tsx` — NavLink con icono y active state
- `index.ts` — barrel exports

**Config/Utils:**
- `shared/config/routes.ts` — constantes de rutas
- `shared/utils/errorHandler.ts` — getErrorMessage, getErrorStatus
- `index.css` — animaciones slide-in/slide-out para Toast

### Verificación

- ✅ `npm run build` exitoso — 187 módulos, 0 errores TypeScript
- ✅ 21 chunks con code-split via lazy loading
- ✅ Bundle principal: 319KB JS (105KB gzip)
- ✅ Toast con animaciones y auto-dismiss
- ✅ Navbar responsive (desktop + mobile hamburger)

---

*Este archivo se actualiza manualmente al completar cada historia de usuario o cambio significativo.*