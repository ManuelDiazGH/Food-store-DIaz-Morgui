# Progreso del Proyecto — Food Store E-Commerce

> **Actualizado**: 2026-05-13  
> **Último commit**: `70298e5` — feat: admin product CRUD, order visualization, admin metrics  
> **Setup000**: ✅ ARCHIVADO  
> **Sprint 0**: ✅ CERRADO  
> **Sprint 1**: ✅ COMPLETADO  
> **Sprint 2**: ✅ COMPLETADO  
> **Sprint 3**: ✅ COMPLETADO  
> **Sprint 4**: ✅ COMPLETADO  
> **Sprint 5**: ✅ COMPLETADO  
> **Sprint 6**: ✅ COMPLETADO  
> **Sprint 7**: ✅ COMPLETADO  
> **Sprint 8**: ✅ COMPLETADO  

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
| **Backend: Auth JWT + RBAC + Refresh Tokens** | ✅ **Completada** | US-000d |
| **Backend: Patrones base (BaseRepository, UoW, Soft Delete)** | ✅ **Completada** | US-000d |
| **Backend: 11 módulos feature-first** | ✅ **Completada** | US-000f + Sprints |
| **Backend: Integración MercadoPago** | ✅ **Completada** | Sprint 6 |
| **Backend: Validación pre-checkout** | ✅ **Completada** | Sprint 5 |
| **Backend: Snapshot de dirección en pedidos** | ✅ **Completada** | Sprint 5 |
| **Frontend: Setup (Vite + React + TS + Tailwind)** | ✅ **Completada** | US-000c |
| **Frontend: Architecture (TanStack Query, Axios, Zustand)** | ✅ **Completada** | US-000e |
| **Frontend: Auth pages + Navbar + Routing** | ✅ **Completada** | Sprint 1 |
| **Frontend: Admin Categorías + Ingredientes** | ✅ **Completada** | Sprint 2 |
| **Frontend: Catálogo de productos + Perfil** | ✅ **Completada** | Sprint 3 |
| **Frontend: Carrito de compras + Direcciones** | ✅ **Completada** | Sprint 4 |
| **Frontend: Checkout + Historial de pedidos** | ✅ **Completada** | Sprint 5 |
| **Frontend: Pagos MP + Panel FSM (Gestión pedidos)** | ✅ **Completada** | Sprint 6 |
| **Frontend: Admin/Stock CRUD de productos** | ✅ **Completada** | Sprint 8 — admin-product-crud |
| **Backend: Admin usuarios + Dashboard metrics** | ✅ **Completada** | Sprint 8 — admin-metrics |
| **Frontend: Visualización pedidos backend** | ✅ **Completada** | Sprint 7 — order-visualization |

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
- `backend/app/core/uow.py` — UnitOfWork (119 líneas)
- `backend/app/core/dependencies.py` — FastAPI dependencies (74 líneas)
- `backend/app/modules/auth/schemas.py` — Pydantic v2 schemas (51 líneas)
- `backend/app/modules/auth/service.py` — AuthService (177 líneas)
- `backend/app/modules/auth/router.py` — Auth endpoints (97 líneas)

**Repositorios implementados**:

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
- `frontend/src/entities/api/axios.ts` — Axios instance con interceptors JWT + refresh queue
- `frontend/src/entities/types/index.ts` — TypeScript interfaces (25+)
- `frontend/src/features/auth/store/authStore.ts` — Zustand auth con persist
- `frontend/src/features/cart/store/cartStore.ts` — Zustand cart con persist
- `frontend/src/app/providers.tsx` — AppProviders con QueryClientProvider

---

### US-000f — Módulos funcionales (Feature-First CRUD) ✅

**Estado**: Completada  

**Módulos implementados con schemas + service + router completos**:

#### Módulo: Usuarios
- **schemas.py**: `UsuarioCreate`, `UsuarioUpdate`, `UsuarioRead` (con roles), `UsuarioRolCreate`
- **service.py**: `UsuarioService` — create, get_by_id, get_all, update, delete (soft), assign_role
- **router.py**: CRUD completo con RBAC

#### Módulo: Categorías
- **schemas.py**: `CategoriaCreate`, `CategoriaUpdate`, `CategoriaRead`, `CategoriaTreeNode` (Sprint 2)
- **service.py**: `CategoriaService` — incluye CTE recursivo para árbol + detección de ciclos
- **router.py**: CRUD + `GET /tree` público (Sprint 2)

#### Módulo: Productos
- **schemas.py**: `ProductoCreate`, `ProductoUpdate`, `ProductoRead`, `ProductoCatalogoRead`, `ProductoDetalleRead`, `ProductoListResponse`, `StockUpdate`
- **service.py**: CRUD + asociación M2M (categorías/ingredientes) + catálogo paginado con filtros + `update_stock_atomic`
- **router.py**: CRUD + catálogo público + stock update

#### Módulo: Pedidos (FSM)
- **schemas.py**: `CrearPedidoRequest`, `DetalleItem`, `EstadoUpdateRequest`, `PedidoRead`, `ValidarItemsRequest/Response`, `ItemValidado`
- **service.py**: `PedidoService` — create con snapshot de dirección y precios, `transicionar_estado` (FSM), `validar_items` (stock + precio)
- **FSM**: PENDIENTE → CONFIRMADO → EN_PREPARACION → EN_CAMINO → ENTREGADO / CANCELADO
- **router.py**: CRUD + `POST /validar` + `GET /{id}/historial`

#### Módulo: Pagos
- **schemas.py**: `CrearPagoRequest`, `PagoRead`, `WebhookMPRequest`
- **core/mp.py**: SDK MercadoPago singleton (creado en Sprint 6)
- **service.py**: `PagoService` — crear_pago con MP SDK, webhook con mapeo de estados
- **router.py**: `POST /crear`, `POST /webhook`, `GET /pedido/{pedido_id}`

#### Módulo: Direcciones
- **schemas.py**: `DireccionCreate`, `DireccionUpdate`, `DireccionRead`
- **service.py**: CRUD + toggle dirección principal
- **router.py**: CRUD + `PATCH /{id}/principal`

#### Módulo: Perfil (creado en Sprint 3)
- **schemas.py**: `PerfilRead`, `PerfilUpdate`, `PasswordChangeRequest`
- **service.py**: `PerfilService` — ver perfil, editar perfil, cambiar password (revoca refresh tokens)
- **router.py**: `GET /perfil`, `PUT /perfil`, `PUT /perfil/password`

#### Módulos restantes
- **Refreshtokens**: Admin revocation
- **Admin**: Dashboard stats
- **Auth**: JWT completo con 5 endpoints

---

## Sprints Completados

### Sprint 1 — Auth y Navegación ✅

**Estado**: Completado  
**Commits**: `9133c29`

**Historias implementadas**:

| Historia | Nombre | Estado |
|----------|--------|--------|
| US-001 | Registro de cliente | ✅ RegisterForm + RegisterPage |
| US-002 | Login de usuario | ✅ LoginForm + LoginPage + rate limiting 429 |
| US-003 | Refresh de token | ✅ Axios interceptor con refresh queue |
| US-004 | Logout | ✅ Navbar logout button + useLogout mutation |
| US-005 | Gestión de roles (RBAC) | ✅ AdminUsersPage + AssignRoleDialog + RoleBadge |
| US-006 | Protección de rutas por rol | ✅ ProtectedRoute + RoleGuard |
| US-066 | Token expirado | ✅ Axios interceptor con refresh automático |
| US-067 | Errores global frontend | ✅ Toast system + ErrorBoundary + errorHandler |
| US-073 | Rate limiting feedback | ✅ 429 handling en LoginForm |
| US-075 | Navegación por rol | ✅ Navbar responsive con menú por rol |
| US-076 | Protección rutas frontend | ✅ React Router guards + 403 RoleGuard |

**Archivos clave**:
- `frontend/src/app/router.tsx` — routing completo
- `frontend/src/app/Layout.tsx` — Layout global con Navbar + Outlet + Footer
- `frontend/src/features/auth/guards/ProtectedRoute.tsx`, `RoleGuard.tsx`
- `frontend/src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx`
- `frontend/src/pages/admin/AdminUsersPage.tsx`
- `frontend/src/widgets/Navbar/Navbar.tsx`, `NavItem.tsx`
- `frontend/src/shared/ui/Button.tsx`, `Input.tsx`, `Spinner.tsx`, `Toast.tsx`
- `frontend/src/entities/api/authApi.ts`, `userApi.ts`

---

### Sprint 2 — Categorías e Ingredientes ✅

**Estado**: Completado  
**Commits**: `9487557`

**Historias implementadas**:

| Historia | Nombre |
|----------|--------|
| US-008 | Árbol de categorías (CTE recursivo) |
| US-009 | Detección de ciclos en categorías |
| US-010 | Soft delete con subcategorías |
| — | RBAC: STOCK puede gestionar catálogo (RN-RB06) |

**Backend**:
- `GET /api/v1/categorias/tree` — endpoint público con CTE recursivo
- Detección de ciclos vía `has_cycle()` en repository
- Permisos cambiados de ADMIN-only a ADMIN+STOCK para categorías e ingredientes

**Frontend**:
- `DataTable` reutilizable con paginación
- `ConfirmDialog` para acciones destructivas
- `FormField` (text/select/checkbox)
- Admin pages: `CategoriesAdmin` (árbol colapsable) + `IngredientsAdmin` (tabla con filtro alérgenos)
- API hooks con TanStack Query

---

### Sprint 3 — Productos + Perfil del Cliente ✅

**Estado**: Completado  
**Commits**: `069e780`, `f405d49`, `4d98487`

**Historias implementadas**:

| Historia | Nombre |
|----------|--------|
| US-015 a US-023 | Productos: catálogo, M2M categorías/ingredientes, stock, filtros, detalle |
| US-061 a US-063 | Perfil: ver, editar, cambiar contraseña |

**Backend**:
- Módulo `perfil/` creado (schemas + service + router)
- Productos: catálogo paginado con filtros (categoría, búsqueda ILIKE, excluir alérgenos)
- `update_stock_atomic()` con guard `WHERE stock + delta >= 0`
- Asociación M2M con categorías e ingredientes
- Soft delete de productos (ADMIN-only)

**Frontend**:
- `ProductCard`, `ProductGrid`, `ProductFilters`, `AllergenFilter`, `ProductDetail`
- `CatalogPage` + `ProductDetailPage`
- `ProfilePage` + `ProfileEditForm` + `PasswordChangeForm`
- Validación de teléfono en frontend (US-062)

---

### Sprint 4 — Direcciones de Entrega + Carrito de Compras ✅

**Estado**: Completado  
**Commits**: incluido en `642f3cc`

**Historias implementadas**:

| Historia | Nombre |
|----------|--------|
| US-024 | Crear dirección de entrega |
| US-025 | Listar direcciones |
| US-026 | Editar dirección |
| US-027 | Eliminar dirección |
| US-028 | Marcar dirección como principal |
| US-029 | Agregar producto al carrito |
| US-030 | Excluir ingredientes removibles |
| US-031 | Modificar cantidades |
| US-032 | Eliminar items del carrito |
| US-033 | Ver resumen del carrito |
| US-034 | Vaciar carrito |

**Frontend**:
- `DireccionCard` (con badge de principal, acciones editar/eliminar/principal)
- `DireccionForm` (modal create/update)
- `DireccionesPage` — lista completa con modales
- `CartDrawer` — drawer lateral con overlay, items, total, link a carrito
- `CartPage` — página completa con items, resumen, vaciar carrito
- `ProductDetail` actualizado con selector de cantidad + exclusión de ingredientes

---

### Sprint 5 — Checkout y Creación de Pedidos ✅

**Estado**: Completado  
**Commits**: incluido en `642f3cc`

**Historias implementadas**:

| Historia | Nombre |
|----------|--------|
| US-035 | Crear pedido |
| US-036 | Resumen del pedido |
| US-037 | Decrementar stock al crear pedido |
| US-038 | Snapshot de dirección en pedido |
| US-044 | Historial de estados del pedido |
| US-049 | Listar mis pedidos |
| US-050 | Ver detalle del pedido |
| US-069 | Validación pre-checkout |
| US-070 | Detección de cambios de precio |
| US-071 | Confirmación de pedido |

**Backend**:
- 5 campos snapshot de dirección en modelo `Pedido` + migración Alembic
- `POST /api/pedidos/validar` — valida stock, disponibilidad, precios
- `GET /api/pedidos/{id}/historial` — historial append-only

**Frontend**:
- `CheckoutPage` — resumen del carrito, selección de dirección, crear pedido
- `OrdersPage` — lista de pedidos con filtro por estado
- `OrderDetailPage` — items con snapshot, dirección, historial de estados
- API hooks en `pedidosApi.ts`

---

### Sprint 6 — Pagos con MercadoPago + Panel FSM ✅

**Estado**: Completado  
**Commits**: incluido en `642f3cc`

**Historias implementadas**:

| Historia | Nombre |
|----------|--------|
| US-039 | Confirmar pedido (transición PENDIENTE → CONFIRMADO) |
| US-040 | Iniciar preparación (CONFIRMADO → EN_PREPARACIÓN) |
| US-041 | Marcar en camino (EN_PREPARACIÓN → EN_CAMINO) |
| US-042 | Marcar entregado (EN_CAMINO → ENTREGADO) |
| US-043 | Cancelar pedido con motivo (CONFIRMADO → CANCELADO) |
| US-044 | Historial de estados |
| US-045 | Pago con MercadoPago |
| US-046 | Redirección a MercadoPago |
| US-047 | Estado del pago |
| US-048 | Reintentar pago |
| US-072 | Callback de pago |

**Backend**:
- `core/mp.py` — SDK singleton de MercadoPago
- `crear_pago()` genera preference en MP, devuelve `init_point`
- Webhook mapea estados MP (approved → CONFIRMADO, rejected → PENDIENTE)
- Idempotency key evita transiciones duplicadas

**Frontend**:
- `CheckoutPage` — integra pago: inicia pago, redirige a MP, maneja callback
- `OrderDetailPage` — muestra estado del pago + botón reintentar
- `OrdersPanelPage` — panel FSM para roles PEDIDOS/ADMIN
- `StateTransitionButton` + `TransitionModal` (razón requerida para cancelar)
- `OrderTable` con badge de estado + acciones disponibles

---

## OPSX Changes

Todos los cambios están **archivados**. No hay cambios activos.

| Change | Sprint | Estado |
|--------|--------|--------|
| `setup000` | Sprint 0 — Infraestructura Base | ✅ Archivado |
| `sprint1` | Sprint 1 — Auth y Navegación | ✅ Archivado |
| `sprint2-categorias-ingredientes` | Sprint 2 — Categorías e Ingredientes | ✅ Archivado |
| `sprint3` | Sprint 3 — Productos y Perfil | ✅ Archivado |
| `sprint4` | Sprint 4 — Direcciones y Carrito | ✅ Archivado |
| `sprint5` | Sprint 5 — Checkout y Pedidos | ✅ Archivado |
| `sprint6` | Sprint 6 — Pagos MP y Panel FSM | ✅ Archivado |
| `admin-product-crud` | Sprint 8 — Admin CRUD Productos | ✅ Archivado |
| `sprint7-order-visualization` | Sprint 7 — Visualización Pedidos | ✅ Archivado |
| `sprint8-admin-metrics` | Sprint 8 — Admin Metrics | ✅ Archivado |

### Cambios activos

"Cambios activos" se refiere a cambios de OPSX que están en progreso (no archivados). Cuando usás el flujo OPSX (`/opsx:propose` → `/opsx:apply` → `/opsx:archive`), mientras un cambio está siendo implementado, figura como activo en `openspec list`. Hoy **no hay ninguno activo** — todo está archivado.

---

## Estructura Actual del Proyecto

```
food-store/
├── backend/                              ← FastAPI + SQLModel
│   ├── .env.example                      ← Variables de entorno (9 vars)
│   ├── alembic.ini                       ← Config migraciones
│   ├── alembic/                          ← Migraciones versionadas
│   │   └── versions/
│   │       ├── 1b0f96613ef5_initial.py   ← 16 tablas iniciales
│   │       └── 37879993625a_*.py         ← Address snapshot fields
│   ├── requirements.txt                  ← 50 dependencias
│   └── app/
│       ├── __init__.py
│       ├── main.py                       ← FastAPI factory (43+ rutas)
│       ├── core/
│       │   ├── config.py                 ← Pydantic Settings
│       │   ├── database.py               ← SQLAlchemy engine + session
│       │   ├── security.py               ← bcrypt, JWT, UUID refresh
│       │   ├── base_repository.py        ← BaseRepository[T] genérico
│       │   ├── uow.py                    ← UnitOfWork (15 repos)
│       │   ├── dependencies.py           ← get_current_user, require_role RBAC
│       │   ├── mp.py                     ← MercadoPago SDK singleton (Sprint 6)
│       │   └── validators.py            ← Validadores compartidos (Sprint 5/6)
│       ├── db/
│       │   └── seed.py                   ← Seed idempotente
│       ├── models/
│       │   └── all_models.py             ← 16 modelos SQLModel
│       └── modules/
│           ├── admin/                    ← Dashboard stats
│           ├── auth/                     ← JWT auth completo (5 endpoints)
│           ├── categorias/               ← CRUD + CTE tree + cycle detection
│           ├── direcciones/              ← CRUD + dirección principal
│           ├── ingredientes/             ← CRUD + alérgenos
│           ├── pagos/                    ← MP integration + webhook
│           ├── pedidos/                  ← FSM + audit trail + snapshots + validación
│           ├── perfil/                   ← Ver/editar perfil + cambiar password
│           ├── productos/                ← CRUD + catálogo + stock atómico + M2M
│           ├── refreshtokens/            ← Admin revocation
│           └── usuarios/                ← CRUD + RBAC + soft delete
├── frontend/                             ← React + Vite + TypeScript
│   ├── package.json                     ← 352 paquetes instalados
│   ├── tsconfig.json                    ← Strict mode + path aliases
│   ├── vite.config.ts                   ← React plugin + proxy + aliases
│   ├── tailwind.config.js               ← Tailwind scan config
│   ├── postcss.config.js                ← PostCSS + Autoprefixer
│   ├── index.html                       ← Entry point
│   └── src/
│       ├── main.tsx                     ← React DOM + AppProviders
│       ├── App.tsx                      ← RouterProvider + ErrorBoundary
│       ├── index.css                    ← Tailwind directives + Toast animations
│       ├── app/
│       │   ├── providers.tsx            ← AppProviders globales
│       │   ├── router.tsx               ← createBrowserRouter con guards
│       │   ├── Layout.tsx               ← Navbar + Outlet + CartDrawer
│       │   └── error-boundary.tsx       ← ErrorBoundary global
│       ├── entities/
│       │   ├── api/
│       │   │   ├── queryClient.ts       ← TanStack Query config
│       │   │   ├── axios.ts             ← JWT interceptor + refresh queue
│       │   │   ├── authApi.ts           ← Hooks auth (login, register, logout, me)
│       │   │   ├── userApi.ts           ← Hooks usuarios CRUD
│       │   │   ├── categorias.ts        ← Hooks categorías
│       │   │   ├── ingredientes.ts      ← Hooks ingredientes
│       │   │   ├── productosApi.ts      ← Hooks productos + catálogo
│       │   │   ├── perfilApi.ts         ← Hooks perfil
│       │   │   ├── direccionesApi.ts    ← Hooks direcciones
│       │   │   └── pedidosApi.ts        ← Hooks pedidos + pagos
│       │   └── types/
│       │       └── index.ts            ← 25+ TS interfaces
│       ├── features/
│       │   ├── admin/                   ← Admin users, hooks
│       │   ├── auth/                    ← Auth guards, stores
│       │   ├── cart/                    ← CartDrawer, store
│       │   ├── catalogo/                ← ProductCard, ProductGrid, filters
│       │   ├── direcciones/             ← DireccionCard, DireccionForm
│       │   ├── pedidos/                 ← OrderTable, StateTransitionButton, TransitionModal
│       │   └── profile/                 ← ProfileEditForm, PasswordChangeForm
│       ├── pages/
│       │   ├── auth/LoginPage.tsx
│       │   ├── auth/RegisterPage.tsx
│       │   ├── admin/AdminUsersPage.tsx
│       │   ├── admin/AdminDashboardPage.tsx
│       │   ├── admin/CategoriesAdmin.tsx
│       │   ├── admin/IngredientsAdmin.tsx
│       │   ├── pedidos/OrdersPanelPage.tsx  ← Panel FSM (Sprint 6)
│       │   ├── HomePage.tsx
│       │   ├── CatalogPage.tsx
│       │   ├── ProductDetailPage.tsx
│       │   ├── CartPage.tsx
│       │   ├── CheckoutPage.tsx
│       │   ├── OrdersPage.tsx
│       │   ├── OrderDetailPage.tsx
│       │   ├── DireccionesPage.tsx
│       │   ├── ProfilePage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── NotFoundPage.tsx
│       │   └── ForbiddenPage.tsx
│       ├── widgets/
│       │   ├── Navbar/                  ← Navbar responsive + NavItem
│       │   └── admin/                   ← CategoryTree, IngredientTable, etc.
│       └── shared/
│           ├── config/routes.ts         ← Constantes de rutas
│           ├── ui/                      ← Button, Input, Spinner, Toast, DataTable, etc.
│           └── utils/
│               ├── errorHandler.ts      ← Mapeo de errores HTTP
│               └── validators.ts        ← Validación de formularios
├── docs/
│   ├── CHANGES.md
│   ├── Descripcion.txt
│   ├── Historias_de_usuario.txt
│   ├── Integrador.txt
│   └── PROGRESO.md                      ← Este archivo
├── openspec/
│   ├── changes/archive/                 ← 7 cambios archivados
│   │   ├── 2026-05-13-setup000/
│   │   ├── 2026-05-13-sprint1/
│   │   ├── 2026-05-12-sprint2-categorias-ingredientes/
│   │   ├── 2026-05-13-sprint3/
│   │   ├── 2026-05-13-sprint4/
│   │   ├── 2026-05-13-sprint5/
│   │   └── 2026-05-13-sprint6/
│   └── specs/                           ← 22 spec artifacts
│       ├── auth-foundation/
│       ├── backend-setup/
│       ├── categorias-backend/
│       ├── categorias-crud-frontend/
│       ├── categorias-tree/
│       ├── checkout-frontend/
│       ├── database-setup/
│       ├── delivery-addresses-frontend/
│       ├── frontend-setup/
│       ├── ingredientes-backend/
│       ├── ingredientes-crud-frontend/
│       ├── order-creation-backend/
│       ├── order-history-frontend/
│       ├── order-management-frontend/
│       ├── payment-integration/
│       ├── perfil-backend/
│       ├── perfil-frontend/
│       ├── pre-checkout-validation/
│       ├── productos-backend/
│       ├── productos-catalogo-frontend/
│       ├── shared-admin-ui/
│       └── shopping-cart-frontend/
├── AGENTS.md
└── README.md
```

---

## Próximos Pasos

1. ✅ ~~US-000a — Configuración del backend FastAPI~~
2. ✅ ~~US-000b — Modelos SQLModel, migraciones Alembic y seed data~~
3. ✅ ~~US-000c — Frontend Setup (Vite, React, TS, Tailwind)~~
4. ✅ ~~US-000d — Patrones base (BaseRepository, UoW, dependencies RBAC)~~
5. ✅ ~~US-000d — Auth Foundation (JWT, RBAC, refresh tokens)~~
6. ✅ ~~US-000e — Frontend Architecture (TanStack Query, Axios, Zustand)~~
7. ✅ ~~US-000f — Módulos funcionales (10 módulos con CRUD + FSM)~~
8. ✅ ~~Sprint 1 — Auth y Navegación frontend~~
9. ✅ ~~Sprint 2 — Categorías (CTE tree) + Ingredientes (CRUD admin)~~
10. ✅ ~~Sprint 3 — Catálogo de productos + Perfil del cliente~~
11. ✅ ~~Sprint 4 — Direcciones de entrega + Carrito de compras~~
12. ✅ ~~Sprint 5 — Checkout + Creación de pedidos + Validación~~
13. ✅ ~~Sprint 6 — Pagos MercadoPago + Panel FSM de gestión~~

### Pendiente
- 🔲 Tests automatizados (backend: pytest, frontend: Vitest + Testing Library)
  → Bonus +10 pts del TP
- 🔲 US-060 — Configuración del Sistema (EPIC 18, baja prioridad)
- 🔲 Paginación server-side en AdminUsersPage (hoy filtra client-side)
- 🔲 Eliminar páginas placeholder huérfanas (ProductsPage.tsx, StockPage.tsx)

---

## Especificaciones OPSX (22 artifacts)

| Spec | Tipo | Sprint |
|------|------|--------|
| auth-foundation | Foundation | setup000 |
| backend-setup | Foundation | setup000 |
| database-setup | Foundation | setup000 |
| frontend-setup | Foundation | setup000 |
| categorias-backend | Backend | Sprint 2 |
| categorias-crud-frontend | Frontend | Sprint 2 |
| categorias-tree | Frontend | Sprint 2 |
| shared-admin-ui | Frontend | Sprint 2 |
| ingredientes-backend | Backend | Sprint 2 |
| ingredientes-crud-frontend | Frontend | Sprint 2 |
| productos-backend | Backend | Sprint 3 |
| productos-catalogo-frontend | Frontend | Sprint 3 |
| perfil-backend | Backend | Sprint 3 |
| perfil-frontend | Frontend | Sprint 3 |
| delivery-addresses-frontend | Frontend | Sprint 4 |
| shopping-cart-frontend | Frontend | Sprint 4 |
| checkout-frontend | Frontend | Sprint 5 |
| order-creation-backend | Backend | Sprint 5 |
| pre-checkout-validation | Backend | Sprint 5 |
| order-history-frontend | Frontend | Sprint 5 |
| payment-integration | Backend | Sprint 6 |
| order-management-frontend | Frontend | Sprint 6 |
| order-visualization-backend | Backend | Sprint 7 |
| stock-product-crud-frontend | Frontend | Sprint 8 |
| admin-usuarios-backend | Backend | Sprint 8 |

---

*Este archivo se actualiza manualmente al completar cada hito significativo.*
