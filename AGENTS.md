# AGENTS.md — Food Store

**Proyecto**: Sistema de e-commerce de alimentos  
**Estado**: Greenfield (documentación completa, código no implementado aún)  
**Stack**: FastAPI + SQLModel + PostgreSQL + React + TypeScript + Vite

---

## Fuente de verdad

Antes de cada acción, el agente debe leer los documentos en `docs/`:

| Archivo | Contenido |
|--------|-----------|
| `docs/Descripcion.txt` | Visión general, actores, stack tecnológico (402 líneas) |
| `docs/Integrador.txt` | Arquitectura en capas, ERD v5, API REST, patrones (426 líneas) |
| `docs/Historias_de_usuario.txt` | US-000 a US-076 con criterios de aceptación (900+ líneas) |

** Estos documentos son la fuente de verdad. No asumir — siempre consultar.**

---

## Estructura del proyecto

```
food-store/
├── backend/           ← FastAPI (NO IMPLEMENTADO aún)
│   ├── .env.example
│   ├── .venv/        ← Python virtual environment
│   └── requirements.txt
├── frontend/         ← React + Vite (NO IMPLEMENTADO aún)
│   ├── .env.example
│   └── node_modules/
├── docs/              ← Documentación completa
│   ├── Descripcion.txt
│   ├── Integrador.txt
│   └── Historias_de_usuario.txt
├── openspec/          ← OPSX workflow (ya configurado)
├── .opencode/         ← OpenCode skills
├── .cursor/           ← Cursor skills
└── .claude/          ← Claude Code skills
```

---

## Stack Tecnológico

### Backend
- **Framework**: FastAPI 0.111+
- **ORM**: SQLModel 0.0.19+
- **DB**: PostgreSQL 15+
- **Migraciones**: Alembic 1.13+
- **Auth**: JWT (python-jose), Passlib + bcrypt (cost ≥ 12)
- **Rate Limiting**: slowapi
- **Pagos**: MercadoPago SDK Python 2.3.0+

### Frontend
- **Framework**: React 18.x + TypeScript 5.x
- **Bundler**: Vite 5.x
- **Estado servidor**: TanStack Query 5.x
- **Formularios**: TanStack Form 0.x
- **Estado cliente**: Zustand 4.x
- **HTTP**: Axios 1.x
- **Estilos**: Tailwind CSS 3.x
- **Gráficos**: Recharts 2.x
- **Pagos**: @mercadopago/sdk-react

---

## Convenciones de código

### Backend — Feature-First

Cada módulo en su propia carpeta con estructura:

```
modulo/
├── model.py       ← Entidades SQLModel
├── schemas.py    ← Pydantic schemas (Create/Update/Read)
├── repository.py ← Acceso a datos (hereda BaseRepository[T])
├── service.py    ← Lógica de negocio (stateless, recibe UoW)
└── router.py    ← Endpoints HTTP
```

**Capas (flujo unidireccional)**:
```
Router → Service → Unit of Work → Repository → Model
```

- **Router**: HTTP puro, validación schemas, delegar al Service
- **Service**: Lógica de negocio, stateless, recibe UoW por inyección
- **Unit of Work**: Transacciones atómicas, commit/rollback automático
- **Repository**: Acceso a datos, hereda BaseRepository[T] genérico
- **Model**: Tablas SQLModel, sin imports de capas superiores

### Frontend — Feature-Sliced Design

```
frontend/
├── app/           ← Providers, routing, estilos globales
├── pages/         ← Una página por ruta
├── widgets/      ← Bloques de UI compuestos
├── features/     ← Interacciones de usuario (auth, cart, checkout, admin)
├── entities/     ← Modelos de dominio + API
└── shared/       ← UI genéricos, utilitarios, configuración
```

### Separación de estado

| Librería | Qué gestiona |
|----------|-------------|
| Zustand | Estado del cliente: carrito, sesión auth, proceso de pago, UI |
| TanStack Query | Estado del servidor: productos, pedidos, datos remotos con caché |

**NUNCA mezclar ambos en el mismo store.**

---

## Reglas de implementación

### Antes de escribir código

1. **Leer la documentación**: Us-XXX en `docs/Historias_de_usuario.txt` para la historia específica
2. **Verificar dependencias**: Revisar qué otros módulos deben existir primero
3. **Crear cambio en OPSX**: `openspec new change <nombre>` antes de implementar

### Patrones obligatorios

| Patrón | Dónde aplica | Descripción |
|--------|------------|------------|
| Unit of Work | Backend | Transacciones atómicas para pedidos y operaciones complejas |
| BaseRepository[T] | Backend | Repository genérico con CRUD común |
| Snapshot Pattern | Pedidos | Precio/nombre inmutables al crear |
| Soft Delete | Entidades | Campo `eliminado_en` timestamp, nunca DELETE físico |
| Audit Trail | HistorialEstadoPedido | Append-only, solo INSERT |
| FSM | Pedidos | Máquina de estados de 6 estados validados en Service |
| RBAC | Auth | 4 roles: ADMIN, STOCK, PEDIDOS, CLIENT |

### Máquina de estados del Pedido

```
PENDIENTE → CONFIRMADO → EN_PREPARACIÓN → EN_CAMINO → ENTREGADO
              ↓                    ↓
           CANCELADO            (terminal)
```

Estados terminales: ENTREGADO, CANCELADO (no admiten transiciones).

### Autenticación

- **Access Token**: JWT, 30 minutos, HS256
- **Refresh Token**: UUID v4, 7 días, almacenado en BD
- **Rotación**: Cada refresh revoca el token anterior

---

## Convenciones de commits

```
feat(modulo): descripción
fix(modulo): descripción del bug
refactor(modulo): descripción del cambio
test(modulo): descripción de tests
docs(modulo): descripción de documentación
```

---

## Setup para desarrollo

### Backend

```bash
cd backend
cp .env.example .env
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## API

- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Frontend: `http://localhost:5173`

---

## Modelo de datos (ERD v5 — referencia)

### Dominio 1 — Identidad y Acceso
- Usuario (id, email, password_hash, nombre, teléfono)
- Rol (ADMIN, STOCK, PEDIDOS, CLIENT)
- UsuarioRol (M2M)
- RefreshToken (token_hash, expires_at, revoked_at)
- DireccionEntrega (alias, línea, ciudad, cp, es_principal)

### Dominio 2 — Catálogo
- Categoria (nombre, descripcion, padre_id — jerarquía recursiva)
- Producto (nombre, precio, stock_cantidad, disponible)
- Ingrediente (nombre, es_alergeno)
- ProductoCategoria, ProductoIngrediente (M2M)
- FormaPago (codigo, habilitado)

### Dominio 3 — Pedidos
- EstadoPedido (codigo, es_terminal)
- Pedido (estado_codigo, total, snapshots)
- DetallePedido (producto_id, cantidad, precio_snapshot, personalizacion[])
- HistorialEstadoPedido (append-only, transición de estado)
- Pago (mp_payment_id, mp_status, external_reference, idempotency_key)

---

## Errores

Seguir **RFC 7807** (Problem Details for HTTP APIs):

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "Producto no encontrado",
  "instance": "/api/v1/productos/999"
}
```

---

## Notas

- Este proyecto **NO tiene código implementado** — la documentación está completa pero el backend y frontend están vacíos
- Cualquier trabajo debe comenzar por Sprint 0: infraestructura
- Usar always `openspec` CLI para gestionar cambios
- No hay tests aún — el Bonus +10 pts requiere implementarlos

---

## Skills Disponibles

| Skill | Cuándo y cómo usar |
|-------|-------------------|
| `ui-ux-pro-max` | Diseño UI/UX React/Tailwind. Trigger: "diseñar UI", "componente frontend" |
| `vercel-react-best-practices` | Optimización React/Vite. Trigger: "optimizar React", "rendimiento frontend" |
| `issue-creation` | Crear issues GitHub siguiendo flujo del proyecto. Trigger: "crear issue", "reportar bug" |
| `branch-pr` | Crear PRs siguiendo flujo del proyecto. Trigger: "crear PR", "abrir pull request" |
| `skill-creator` | Crear nuevas skills para el agente. Trigger: "crear skill", "nueva habilidad" |
| `find-skills` | Buscar skills instalables. Trigger: "buscar skill", "qué skills hay" |

---
*Actualizado: 2026-05-06*