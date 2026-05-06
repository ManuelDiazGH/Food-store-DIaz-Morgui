# Mapa de Changes — Food Store E-Commerce

> **Fuente**: `docs/Historias_de_usuario.txt`  
> **Total**: 77 historias de usuario · 19 épicas · 9 sprints  
> **Stack**: FastAPI + SQLModel + PostgreSQL · React + TypeScript + Vite

---

## 1. Resumen de Épicas

| Épica | Historias | Prioridad | Sprint |
|-------|-----------|-----------|--------|
| 00 — Infraestructura y Setup | US-000, US-000a, US-000b, US-000c, US-000d, US-000e, US-068, US-074 | Alta | Sprint 0 |
| 01 — Auth y Autorización | US-001 a US-006, US-073 | Alta | Sprint 1 |
| 02 — Navegación y Layout Base | US-075, US-076, US-066, US-067 | Alta | Sprint 1 |
| 03 — Categorías | US-007 a US-010 | Alta | Sprint 2 |
| 04 — Ingredientes y Alérgenos | US-011 a US-014 | Alta | Sprint 2 |
| 05 — Productos y Catálogo | US-015 a US-023 | Alta | Sprint 3 |
| 06 — Perfil del Cliente | US-061, US-062, US-063 | Media | Sprint 3 |
| 07 — Direcciones de Entrega | US-024 a US-028 | Alta | Sprint 4 |
| 08 — Carrito de Compras | US-029 a US-034 | Alta | Sprint 4 |
| 09 — Validaciones Pre-Checkout | US-069, US-070 | Alta/Media | Sprint 5 |
| 10 — Creación de Pedidos | US-035 a US-038 | Alta | Sprint 5 |
| 11 — Pagos MercadoPago | US-045 a US-048 | Alta | Sprint 6 |
| 12 — FSM de Pedidos | US-039 a US-044 | Alta | Sprint 6 |
| 13 — Visualización de Pedidos | US-049 a US-052 | Alta | Sprint 7 |
| 14 — Notificaciones y Feedback UX | US-071, US-072 | Media/Alta | Sprint 7 |
| 15 — Admin Usuarios | US-053 a US-055 | Alta/Media | Sprint 8 |
| 16 — Catálogo Admin | US-064, US-065 | Media | Sprint 8 |
| 17 — Métricas y Dashboard | US-056 a US-059 | Media | Sprint 8 |
| 18 — Configuración del Sistema | US-060 | Baja | Sprint 8 |

---

## 2. Changes por Módulo Backend

### `core/` — Infraestructura transversal

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `core-scaffolding` | US-000 | Monorepo, estructura de carpetas, .gitignore, .env.example, README |
| `core-backend-setup` | US-000a | FastAPI, CORS, rate limiting middleware, registro routers, config.py, database.py, security.py |
| `core-db-setup` | US-000b | PostgreSQL, Alembic migraciones, seed de roles (4), estados (6), formas de pago, admin |
| `core-patterns` | US-000d | BaseRepository[T] genérico, UnitOfWork, get_current_user, require_role |
| `core-error-format` | US-068 | Formato RFC 7807, clases custom de error, middleware global |
| `core-validation` | US-074 | Validación de inputs, sanitización XSS, queries parametrizados ORM |

### `auth/` — Autenticación

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `auth-register` | US-001 | Registro con email+password, rol CLIENT automático, bcrypt, retorna tokens |
| `auth-login` | US-002 | Login con JWT access (30min) + refresh (7d), error genérico 401 |
| `auth-refresh` | US-003 | Refresh con rotación, familyId, detección replay attack, revoca todos los tokens |
| `auth-logout` | US-004 | Logout, invalida refresh token en BD, limpia Zustand store |
| `auth-password` | US-063 | Cambio de contraseña con validación de actual, invalida todos los refresh tokens |

### `refreshtokens/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `refresh-token-model` | US-000b, US-002, US-003 | Modelo RefreshToken: token_hash, family_id, expires_at, revoked_at, used |

### `roles/` — RBAC

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `rbac-seed` | US-000b | Seed de 4 roles con IDs estables: ADMIN(1), STOCK(2), PEDIDOS(3), CLIENT(4) |
| `rbac-assign` | US-005 | Asignar/modificar roles de usuarios (solo ADMIN), protección último admin |
| `rbac-guard` | US-006 | Middleware de protección de rutas por rol, 401 sin token, 403 sin permiso |

### `categorias/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `categorias-create` | US-007 | Crear categoría raiz o subcategoría (padre_id), nombre único por nivel |
| `categorias-list` | US-008 | Listar como árbol jerárquico (CTE recursivo), endpoint público |
| `categorias-edit` | US-009 | Editar nombre/padre_id, validación de ciclos en jerarquía |
| `categorias-delete` | US-010 | Soft delete, rechazar si tiene productos activos asociados |

### `ingredientes/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `ingredientes-create` | US-011 | Crear ingrediente con flag es_alergeno, nombre único |
| `ingredientes-list` | US-012 | Listar con filtro ?esAlergeno=true, paginación |
| `ingredientes-edit` | US-013 | Editar nombre/es_alergeno, unicidad de nombre |
| `ingredientes-delete` | US-014 | Soft delete, se mantiene en productos existentes |

### `productos/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `productos-create` | US-015 | Crear producto: nombre, descripción, precio NUMERIC, stock int>=0, imagen, disponible |
| `productos-categorias` | US-016 | Asociar a múltiples categorías (M2M vía ProductoCategoria) |
| `productos-ingredientes` | US-017 | Asociar ingredientes (M2M vía ProductoIngrediente), alergenos destacados |
| `productos-list` | US-018 | Catálogo público: paginación, filtro por categoría, búsqueda por nombre (ILIKE) |
| `productos-detalle` | US-019 | Detalle con ingredientes, alergenos, categorías, stock>0 (sin cantidad exacta) |
| `productos-edit` | US-020 | Editar campos, validación precio>0 con 2 decimales, stock no negativo |
| `productos-stock` | US-021 | Actualizar stock atómico (UPDATE con WHERE stock>=cantidad) |
| `productos-delete` | US-022 | Soft delete, deja de aparecer en catálogo público |
| `productos-filtro-alergenos` | US-023 | ?excluirAlergenos=1,3,7 con NOT EXISTS sobre ProductoIngrediente |

### `direcciones/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `direcciones-create` | US-024 | Crear dirección, primera = predeterminada automática |
| `direcciones-list` | US-025 | Listar propias (filtro por userId del JWT), indicar predeterminada |
| `direcciones-edit` | US-026 | Editar dirección propia, validar ownership |
| `direcciones-delete` | US-027 | Eliminar dirección, reasignar predeterminada si era la default |
| `direcciones-predeterminada` | US-028 | PATCH para marcar predeterminada (transaccional: quitar anterior + setear nueva) |

### `pedidos/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `pedidos-create` | US-035 | Crear pedido atómico (UoW): Pedido + DetallePedido[] + HistorialEstadoPedido, snapshots, vaciar carrito |
| `pedidos-validar-stock` | US-036 | SELECT FOR UPDATE, validar stock suficiente antes de cualquier INSERT |
| `pedidos-snapshots` | US-037, US-038 | Snapshot de precio en DetallePedido.precioUnitario + snapshot dirección en Pedido |
| `pedidos-fsm` | US-039-US-042 | Máquina de estados: validar transiciones, PENDIENTE→CONFIRMADO auto por pago, registro historial |
| `pedidos-cancelar` | US-043 | Cancelar desde PENDIENTE/CONFIRMADO/EN_PREPARACIÓN, restaurar stock si venía de CONFIRMADO |
| `pedidos-historial` | US-044 | GET historial de estados (append-only), con actor, timestamp, motivo |
| `pedidos-mis-pedidos` | US-049, US-050 | Listar propios paginados con filtro por estado, detalle con items y snapshot |
| `pedidos-panel-gestor` | US-051, US-052 | Ver todos los pedidos, filtros por estado/fecha/búsqueda, detalle completo |

### `pagos/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `pagos-crear` | US-045 | Crear orden MercadoPago (Orders API), idempotency_key, external_reference |
| `pagos-webhook` | US-046 | Procesar IPN, verificar firma, consultar API MP, idempotente, responde 200 inmediato |
| `pagos-estado` | US-047 | Consultar estado de pago de pedido propio |
| `pagos-reintentar` | US-048 | Reintentar pago rechazado: nueva orden con nuevo idempotency_key |

### `perfil/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `perfil-view` | US-061 | Ver perfil propio: nombre, email, teléfono, fecha registro |
| `perfil-edit` | US-062 | Editar nombre y teléfono, email no modificable |

### `admin/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `admin-usuarios` | US-053-US-055 | Listar usuarios (búsqueda, filtro rol), editar rol, desactivar (invalida refresh tokens) |
| `admin-catalogo` | US-064 | Acceso ADMIN a CRUD de catálogo (mismos endpoints que STOCK) |
| `admin-pedidos` | US-065 | Acceso ADMIN a gestión de pedidos (mismos endpoints que PEDIDOS) |
| `admin-metricas` | US-056-US-059 | Dashboard: resumen, ventas por periodo (DATE_TRUNC), top productos, distribución por estado |
| `admin-configuracion` | US-060 | Configuración key-value: horarios, zona de entrega, mensajes |

---

## 3. Changes por Módulo Frontend

### `shared/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `shared-axios-setup` | US-000c | Axios instance: base URL, interceptor auth token, interceptor 401 con refresh automático |
| `shared-error-handler` | US-067 | Interceptor de errores HTTP: mapeo códigos a mensajes, toast system |
| `shared-nav` | US-075 | Componente Navigation/Sidebar adaptado por rol del usuario |
| `shared-route-guards` | US-076 | HOC withAuth(Component, requiredRoles), redirección login/403 |
| `shared-token-refresh` | US-066 | Singleton de refresh en progreso, cola de requests concurrentes |

### `shared/stores/` (Zustand)

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `store-auth` | US-000e | authStore: accessToken, refreshToken, user, login, logout, updateTokens, hasRole, persist |
| `store-cart` | US-000e | cartStore: items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, persist |
| `store-payment` | US-000e | paymentStore: checkoutStep, preferenceId, paymentStatus, error (sin persist) |
| `store-ui` | US-000e | uiStore: theme (persist), sidebarOpen, toasts |

### `features/auth/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `auth-register-form` | US-001 | Formulario registro: nombre, email, password (min 8), validaciones |
| `auth-login-form` | US-002 | Formulario login: email, password, manejo errores genéricos |
| `auth-password-change` | US-063 | Formulario cambio contraseña: actual + nueva, confirmación |

### `features/profile/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `profile-view` | US-061 | Vista perfil: nombre, email, teléfono, fecha registro |
| `profile-edit` | US-062 | Editar nombre y teléfono, email readonly |

### `features/direcciones/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `direcciones-crud` | US-024-US-028 | CRUD direcciones + establecer predeterminada, indicador visual default |

### `features/catalogo/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `catalogo-list` | US-018 | Grid de productos: paginación, filtro categoría, búsqueda, solo disponibles |
| `catalogo-detalle` | US-019 | Detalle producto: imagen, descripción, precio, ingredientes, alergenos destacados |
| `catalogo-filtro-alergenos` | US-023 | Filtro excluir alérgenos: checkboxes de ingredientes, recarga resultados |

### `features/carrito/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `carrito-agregar` | US-029, US-030 | Agregar producto + selección de ingredientes a excluir, persistencia localStorage |
| `carrito-gestion` | US-031-US-034 | Modificar cantidad, eliminar item, vaciar carrito con confirmación, resumen con totales |

### `features/checkout/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `checkout-validacion` | US-069, US-070 | Validar disponibilidad y precios actualizados pre-creación, notificar cambios |
| `checkout-crear-pedido` | US-035 | Seleccionar dirección, confirmar pedido, vaciar carrito |
| `checkout-confirmacion` | US-071 | Pantalla de éxito: número pedido, resumen, link a pagar y ver detalle |

### `features/pagos/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `pago-crear` | US-045 | Integración SDK MercadoPago, tokenización tarjeta, redirect checkout |
| `pago-callback` | US-072 | Página retorno MP: success/failure/pending con mensajes y acciones |
| `pago-reintentar` | US-048 | Reintentar desde estado rechazado, nueva orden de pago |

### `features/pedidos/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `pedidos-mis-pedidos` | US-049 | Lista paginada de pedidos propios: número, fecha, estado, total, filtro por estado |
| `pedidos-detalle` | US-050 | Detalle: items con snapshots, dirección, estado, estado de pago |
| `pedidos-historial` | US-044 | Timeline de transiciones de estado con fecha y actor |

### `widgets/admin/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `admin-panel-pedidos` | US-051, US-052 | Tabla todos los pedidos con filtros, detalle completo con historial |
| `admin-panel-usuarios` | US-053-US-055 | Tabla usuarios, edición rol, activar/desactivar |
| `admin-panel-catalogo` | US-064 | CRUD productos/categorías/ingredientes (mismos forms que Gestor Stock) |
| `admin-gestion-fsm` | US-040-US-043 | Panel avanzar estado de pedidos, cancelar con motivo |
| `admin-dashboard` | US-056-US-059 | Dashboard métricas: KPIs, LineChart ventas, BarChart top productos, PieChart estados |
| `admin-configuracion` | US-060 | Formulario configuración: horarios, zona, mensajes |

### `app/`

| Change | Historias | Descripción |
|--------|-----------|-------------|
| `app-providers` | US-000c | QueryClientProvider, auth providers, estilos globales |
| `app-routing` | US-000c, US-076 | Rutas públicas y privadas, lazy loading por rol |

---

## 4. Árbol de Dependencias

```
Sprint 0: EPIC 00 — Infraestructura y Setup
├── US-000: Scaffolding del monorepo ← (sin dependencias)
│   ├── US-000a: Config backend (FastAPI + deps) ← US-000
│   │   └── US-000b: PostgreSQL + Alembic + seed ← US-000a
│   │       └── US-000d: Patrones base (BaseRepository, UoW, deps) ← US-000b
│   │
│   └── US-000c: Config frontend (React + Vite + deps) ← US-000
│       └── US-000e: Stores Zustand ← US-000c
│
├── US-068: Manejo de errores estandarizado ← (sin dependencias)
└── US-074: Validación y sanitización de inputs ← (sin dependencias)

Sprint 1: EPIC 01 — Auth y EPIC 02 — Navegación
├── US-001: Registro ← US-000a, US-000b, US-000d
│   ├── US-002: Login ← US-001
│   │   ├── US-003: Refresh token ← US-002
│   │   ├── US-004: Logout ← US-002
│   │   ├── US-005: Gestión de roles (RBAC) ← US-001
│   │   │   └── US-006: Protección rutas por rol ← US-005
│   │   └── US-073: Rate limiting ← US-002
│   │
│   └── US-063: Cambiar contraseña ← US-002
│
└── US-075: Navegación por rol ← US-006
    └── US-076: Protección rutas frontend ← US-075
    ├── US-066: Manejo token expirado ← US-003
    └── US-067: Manejo errores global frontend ← US-002

Sprint 2: EPIC 03 — Categorías + EPIC 04 — Ingredientes
├── US-007: Crear categoría ← US-006
│   ├── US-008: Listar categorías (árbol) ← US-007
│   ├── US-009: Editar categoría ← US-007
│   └── US-010: Eliminar categoría (soft delete) ← US-007
│
└── US-011: Crear ingrediente ← US-006
    ├── US-012: Listar ingredientes ← US-011
    ├── US-013: Editar ingrediente ← US-011
    └── US-014: Eliminar ingrediente (soft delete) ← US-011

Sprint 3: EPIC 05 — Productos + EPIC 06 — Perfil
├── US-015: Crear producto ← US-007, US-011
│   ├── US-016: Asociar categorías (M2M) ← US-015, US-007
│   ├── US-017: Asociar ingredientes (M2M) ← US-015, US-011
│   │   ├── US-019: Detalle producto ← US-017
│   │   └── US-023: Filtro alérgenos ← US-017
│   ├── US-018: Catálogo público ← US-015
│   ├── US-020: Editar producto ← US-015
│   ├── US-021: Gestionar stock ← US-015
│   └── US-022: Eliminar producto (soft delete) ← US-015
│
├── US-061: Ver perfil ← US-002
│   └── US-062: Editar perfil ← US-061
│
└── US-063: Cambiar contraseña ← US-002

Sprint 4: EPIC 07 — Direcciones + EPIC 08 — Carrito
├── US-024: Crear dirección ← US-002
│   ├── US-025: Listar direcciones ← US-024
│   ├── US-026: Editar dirección ← US-024
│   ├── US-027: Eliminar dirección ← US-024
│   └── US-028: Establecer predeterminada ← US-024
│
└── US-029: Agregar al carrito ← US-018
    ├── US-030: Personalizar (excluir ingredientes) ← US-029, US-017
    ├── US-031: Modificar cantidad ← US-029
    ├── US-032: Eliminar item ← US-029
    ├── US-033: Ver resumen carrito ← US-029
    └── US-034: Vaciar carrito ← US-029

Sprint 5: EPIC 09 — Validaciones + EPIC 10 — Pedidos
├── US-069: Validar disponibilidad checkout ← US-029, US-035
│   └── US-070: Verificar precios actualizados ← US-069
│
└── US-035: Crear pedido (UoW, snapshots) ← US-029, US-024
    ├── US-036: Validar stock (SELECT FOR UPDATE) ← US-035
    ├── US-037: Snapshot precios ← US-035
    └── US-038: Snapshot dirección ← US-035

Sprint 6: EPIC 11 — Pagos + EPIC 12 — FSM
├── US-045: Iniciar pago (MercadoPago) ← US-035
│   ├── US-046: Webhook IPN (idempotente) ← US-045
│   │   ├── US-047: Consultar estado de pago ← US-045
│   │   └── US-048: Reintentar pago rechazado ← US-046
│   │
│   └── US-072: Feedback retorno MP ← US-045
│
└── US-039: PENDIENTE→CONFIRMADO (auto por pago) ← US-035, US-046
    ├── US-040: CONFIRMADO→EN_PREPARACIÓN ← US-039
    │   └── US-041: EN_PREPARACIÓN→EN_CAMINO ← US-040
    │       └── US-042: EN_CAMINO→ENTREGADO ← US-041
    ├── US-043: Cancelar pedido (restaurar stock) ← US-035
    └── US-044: Historial de estados (append-only) ← US-039

Sprint 7: EPIC 13 — Visualización + EPIC 14 — Notificaciones
├── US-049: Ver mis pedidos (Cliente) ← US-035
│   └── US-050: Detalle pedido propio ← US-049
│
├── US-051: Panel todos los pedidos (Gestor) ← US-035
│   └── US-052: Detalle cualquier pedido ← US-051
│
└── US-071: Confirmación pedido creado ← US-035

Sprint 8: EPIC 15-18 — Admin + Métricas + Config
├── US-053: Listar usuarios ← US-005
│   ├── US-054: Editar usuario ← US-053
│   └── US-055: Desactivar usuario ← US-053
│
├── US-064: Gestión catálogo (Admin) ← US-015, US-007, US-011
├── US-065: Gestión pedidos (Admin) ← US-051, US-043
│
├── US-056: Dashboard métricas ← US-035, US-053
│   ├── US-057: Gráfico ventas por periodo ← US-056
│   ├── US-058: Top productos vendidos ← US-056
│   └── US-059: Pedidos por estado ← US-056
│
└── US-060: Configuración del sistema ← US-006
```

---

## 5. Matriz de Dependencias Críticas

```
US-000 (scaffolding)
  ↓
US-000a (backend setup) → US-000b (BD + seed) → US-000d (patrones base)
  ↓                                               ↓
US-000c (frontend setup) → US-000e (stores)    US-001 (registro)
                                                    ↓
                                              US-002 (login)
                                                    ↓
              ┌──────────┬──────────┬───────────────┼──────────┐
              ↓          ↓          ↓               ↓          ↓
         US-005      US-003      US-024          US-063    US-004
        (RBAC)     (refresh)   (direcciones)    (passwd)   (logout)
              ↓          ↓
         US-006      US-066
        (guards)   (token refresh)
              ↓
    ┌─────┬───┴───────┬──────────┐
    ↓     ↓           ↓          ↓
 US-007 US-011     US-075     US-073
(categ) (ingr)    (naveg)   (rate limit)
    ↓     ↓
    └──┬──┘
       ↓
   US-015 (productos)
       ↓
   US-018 (catálogo público)
       ↓
   US-029 (carrito) ──────────┐
       ↓                       │
   US-035 (crear pedido) ←─────┘ + US-024 (direcciones)
       ↓
  ┌────┼──────────────┬────────────┐
  ↓    ↓              ↓            ↓
US-045 US-036       US-039       US-049
(pago)(stock)       (FSM)       (mis pedidos)
  ↓    ↓              ↓
US-046 US-037       US-040 → US-041 → US-042
(webhook)(snapshot)  (flujo estados lineal)
```

---

## 6. Máquina de Estados de Pedidos (FSM)

```
                    ┌─────────────────────────────────┐
                    │                                 │
  PENDIENTE ─────→ CONFIRMADO ─────→ EN_PREPARACIÓN ─────→ EN_CAMINO ─────→ ENTREGADO
      │                  │
      │                  │
      ▼                  ▼
  CANCELADO ◄───────────┘
  (terminal)
```

| Estado | ID | Es Terminal | Transiciones Válidas | Actor |
|--------|----|-------------|---------------------|-------|
| PENDIENTE | 1 | No | CONFIRMADO, CANCELADO | SISTEMA (confirmar), Cliente/Gestor/Admin (cancelar) |
| CONFIRMADO | 2 | No | EN_PREPARACIÓN, CANCELADO | Gestor/Admin |
| EN_PREPARACIÓN | 3 | No | EN_CAMINO, CANCELADO | Gestor/Admin (cancelar: solo Admin) |
| EN_CAMINO | 4 | No | ENTREGADO | Gestor/Admin |
| ENTREGADO | 5 | Sí | — | — |
| CANCELADO | 6 | Sí | — | — |

### Reglas clave de la FSM

- **PENDIENTE → CONFIRMADO**: solo automático por webhook de pago approved (RN-FS02)
- **Al confirmar**: decremento atómico de stock (RN-FS03), rollback si falla (RN-FS04)
- **CANCELADO desde CONFIRMADO**: restaurar stock atómicamente (RN-FS05)
- **Estados terminales**: ENTREGADO y CANCELADO no admiten transiciones (RN-FS06)
- **Historial**: append-only, solo INSERT, nunca UPDATE ni DELETE (RN-FS07, RN-DA05)
- **Cada registro**: estado anterior, estado nuevo, timestamp, usuario/SISTEMA, observación (RN-FS09)

---

## 7. Reglas de Negocio por Dominio (Referencia Rápida)

### Autenticación (RN-AU01 a RN-AU10)
| ID | Regla |
|----|-------|
| RN-AU01 | Password nunca en texto plano; bcrypt cost >= 10 con salt automático |
| RN-AU02 | Access token JWT: 30 min, claims userId+email+roles, HS256 |
| RN-AU03 | Refresh token: 7 días, UUID v4 opaco almacenado en BD |
| RN-AU04 | Rotación de refresh token: anterior se revoca, se emite nuevo |
| RN-AU05 | Detección replay attack: reuso de token revocado → revocar TODOS los tokens del usuario |
| RN-AU06 | Rate limiting login: 5 intentos/IP en 15 min → HTTP 429 |
| RN-AU07 | Al registrarse se asigna rol CLIENT automáticamente (no viene del request) |
| RN-AU08 | Login no diferencia "email no existe" de "contraseña incorrecta" |
| RN-AU09 | Datos de tarjeta NUNCA pasan por servidor (PCI DSS SAQ-A) |
| RN-AU10 | .env con secrets NUNCA se commitea |

### Autorización / RBAC (RN-RB01 a RN-RB10)
| ID | Regla |
|----|-------|
| RN-RB01 | 4 roles fijos: ADMIN(1), STOCK(2), PEDIDOS(3), CLIENT(4) |
| RN-RB02 | Múltiples roles simultáneos (M2M con UNIQUE compuesta) |
| RN-RB03 | Solo ADMIN asigna/modifica roles de otros |
| RN-RB04 | Último admin no puede quitarse rol ADMIN |
| RN-RB05 | CLIENT solo opera sobre sus propios datos |
| RN-RB06 | Stock NO accede a pedidos, usuarios ni métricas |
| RN-RB07 | Pedidos NO accede a catálogo ni gestión de usuarios |
| RN-RB08 | Solo ADMIN puede cancelar pedidos en EN_PREPARACIÓN |
| RN-RB09 | Sin rol requerido → HTTP 403 |
| RN-RB10 | Sin token válido → HTTP 401; rutas públicas no requieren auth |

### Catálogo (RN-CA01 a RN-CA10)
| ID | Regla |
|----|-------|
| RN-CA01 | Categorías con jerarquía arbitraria (padre_id autoreferencial) |
| RN-CA02 | No ciclos en jerarquía de categorías |
| RN-CA03 | No eliminar categoría con productos activos asociados |
| RN-CA04 | Precio: NUMERIC precisión fija (nunca float/double) |
| RN-CA05 | Stock: entero >= 0, nunca negativo |
| RN-CA06 | Producto → múltiples categorías (M2M) |
| RN-CA07 | Producto → múltiples ingredientes (M2M), flag es_alergeno |
| RN-CA08 | Catálogo público: solo disponible=true y eliminado_en IS NULL |
| RN-CA09 | Soft delete: eliminado_en timestamp, NUNCA borrado físico |
| RN-CA10 | Admin puede usar parámetro incluir_eliminados |

### Pedidos — Creación (RN-PE01 a RN-PE08)
| ID | Regla |
|----|-------|
| RN-PE01 | Creación ATÓMICA (Unit of Work): todo o nada |
| RN-PE02 | Snapshot de precio en DetallePedido.precio_snapshot |
| RN-PE03 | Snapshot de dirección en Pedido.direccion_snapshot |
| RN-PE04 | Validar stock suficiente DENTRO de transacción (SELECT FOR UPDATE) |
| RN-PE05 | Si falta stock en algún producto, no se crea NINGÚN ítem |
| RN-PE06 | Todo pedido nace en PENDIENTE con registro inicial en HistorialEstadoPedido |
| RN-PE07 | Personalización como INTEGER[] en DetallePedido |
| RN-PE08 | Total = suma(cantidad × precio_snapshot) + costo envío |

### Pagos — MercadoPago (RN-PA01 a RN-PA09)
| ID | Regla |
|----|-------|
| RN-PA01 | Tokenización en browser via SDK MercadoPago.js (nunca tocan servidor) |
| RN-PA02 | Idempotency_key único; webhook duplicado se ignora |
| RN-PA03 | Webhook responde HTTP 200 inmediatamente |
| RN-PA04 | Siempre verificar estado real consultando API de MercadoPago |
| RN-PA05 | Pago approved → PENDIENTE→CONFIRMADO + decremento stock |
| RN-PA06 | Pago rejected → pedido sigue PENDIENTE, cliente puede reintentar |
| RN-PA07 | Pago pending/in_process → actualizar pago, pedido sigue PENDIENTE |
| RN-PA08 | Un pedido puede tener múltiples intentos de pago (1:N) |
| RN-PA09 | external_reference vincula preferencia MP con pedido |

### Datos e Integridad (RN-DA01 a RN-DA08)
| ID | Regla |
|----|-------|
| RN-DA01 | Todas las tablas: creado_en (default NOW), actualizado_en (auto-update) |
| RN-DA02 | IDs de seed (Roles, EstadoPedido) ESTABLES y explícitos |
| RN-DA03 | Script de seed idempotente |
| RN-DA04 | Email UNIQUE con índice |
| RN-DA05 | HistorialEstadoPedido: append-only (solo INSERT) |
| RN-DA06 | Snapshots garantizan inmutabilidad ante cambios futuros |
| RN-DA07 | Paginación skip/limit con total de registros |
| RN-DA08 | Errores de API siguen RFC 7807 (Problem Details for HTTP APIs) |

---

---

# Guía: ¿Qué es un Change y cómo trabajar con ellos?

## ¿Qué es un change?

Un **change** es la unidad mínima de trabajo en el flujo SDD. No es una tarea suelta ni un ticket — es un conjunto de tres artefactos que juntos describen, diseñan e implementan una funcionalidad del sistema de forma completa y trazable.

Cada change tiene su propia carpeta dentro de `openspec/changes/` y contiene exactamente estos tres archivos:

```
openspec/changes/nombre-del-change/
├── proposal.md   ← QUÉ se va a construir y POR QUÉ
├── design.md     ← CÓMO técnicamente (arquitectura, modelos, endpoints)
└── tasks.md      ← CHECKLIST atómica de implementación
```

Una vez que el change está completamente implementado y verificado, se **archiva**: las specs se sincronizan en `openspec/specs/` y la carpeta del change se mueve al historial. Esa documentación viva queda disponible para todos los changes futuros.

---

## ¿Para qué sirve?

- **Trazabilidad**: cada línea de código tiene una propuesta y un diseño que la justifica.
- **Revisión antes de implementar**: el diseño se aprueba en papel antes de que el agente escriba una sola línea de código. Un error en el diseño cuesta 0. El mismo error en código cuesta horas de refactor.
- **Contexto persistente**: cuando el agente empieza un nuevo change, lee las specs de los changes anteriores ya archivados. Sabe qué existe, qué patrones se usaron, y no propone código duplicado o inconsistente.
- **Documentación automática**: al terminar el proyecto, `openspec/specs/` es la documentación completa del sistema. No hay que escribirla por separado.

---

## ¿Cómo se generan?

Los changes **no se crean a mano** — los genera el agente a partir de los documentos del proyecto y las historias de usuario. El flujo es siempre el mismo:

### 1. Explorar (opcional)
Antes de proponer, podés pedirle al agente que piense y analice el problema:
```
/opsx:explore [tema o pregunta]
```
El agente investiga el codebase y razona con vos. No genera código ni toma compromisos. Útil cuando no tenés claro cómo encaja algo en la arquitectura.

### 2. Proponer
Le pedís al agente que genere los tres artefactos del change:
```
/opsx:propose [nombre-del-change]
```
El agente lee los documentos en `docs/`, las historias de usuario relevantes y las specs ya archivadas. Genera `proposal.md`, `design.md` y `tasks.md`.

**Antes de continuar, revisás los artefactos.** Verificás que:
- El diseño respeta la arquitectura en capas (Router → Service → UoW → Repository → Model)
- Las tareas son atómicas (horas, no días)
- Las reglas de negocio están reflejadas
- El stack tecnológico es el correcto

Si algo está mal, lo corregís antes de implementar.

### 3. Aplicar
Una vez aprobados los artefactos, el agente implementa tarea por tarea:
```
/opsx:apply [nombre-del-change]
```
El agente lee `design.md` y `tasks.md`, implementa cada tarea en orden y la marca como completada. No improvisa — sigue el plan.

### 4. Archivar
Cuando todas las tareas están completas y los tests pasan:
```
/opsx:archive [nombre-del-change]
```
Las specs se sincronizan, el change se mueve al historial y el próximo change ya puede usarlas como contexto.

---

## ¿Cómo saber qué changes crear para este proyecto?

El mapa de changes para Food Store está documentado arriba. Cada sección lista los changes propuestos por módulo, con las historias de usuario que cubren y sus dependencias.

Usá el **árbol de dependencias** (sección 4) para saber en qué orden proponer los changes: empezá siempre por las hojas del árbol que no tengan dependencias pendientes, y avanzá hacia las ramas.

El orden recomendado es el de los **Sprints 0 a 8** detallados en la sección 1.

---

## Reglas importantes

- **Nunca implementes sin artefactos.** Si no existe `proposal.md` y `design.md` aprobados, no hay `/opsx:apply`.
- **El orden importa.** Si el change B necesita código del change A, A tiene que estar archivado antes de proponer B.
- **Un change = un commit** (o varios commits atómicos). Nunca mezcles dos changes en un mismo commit.
- **Las specs son código.** Se versionan en git, se revisan en PRs, evolucionan con el proyecto.
