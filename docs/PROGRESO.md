# Progreso del Proyecto — Food Store E-Commerce

> **Actualizado**: 2026-05-11  
> **Épica activa**: 00 — Infraestructura y Setup (Sprint 0)  
> **Setup000**: 10/39 tareas completadas

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
| Backend: Models SQLModel + DB | 🔲 Pendiente | — |
| **Backend: Config FastAPI + CORS** | ✅ **Completada** | US-000a |
| Backend: Auth JWT (utilidades base) | ✅ Stubs + utils | US-000a |
| **Backend: Modelos + DB + Migraciones** | ✅ **Completada** | US-000b |
| Backend: Módulos funcionales | 🔲 Pendiente | — |
| Frontend: Stores Zustand | 🔲 Pendiente | — |
| Frontend: Componentes UI | 🔲 Pendiente | — |

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
- Routers de módulos actualizados con APIRouter y prefijos `/api/v1/`

---

## OPSX Changes

### `setup000` — Sprint 0: Infraestructura Base 🔄

**Artefactos**: Proposal ✅ Design ✅ Specs ✅ Tasks (10/39 completadas)  

| Bloque | Progreso |
|--------|----------|
| 1. Backend Structure and Configuration | ✅ 4/5 tareas |
| 2. Database Setup with SQLModel + Alembic | ✅ 5/5 tareas |
| 2. Database Setup with SQLModel + Alembic | 🔲 0/5 |
| 3. BaseRepository[T] and Unit of Work | 🔲 0/3 |
| 4. Auth Foundation — JWT and Refresh Tokens | 🔲 0/4 |
| 5. Module Structure — Feature-First | 🔲 0/6 |
| 6. Frontend Setup (Vite + React + TS) | 🔲 0/5 |
| 7. Frontend Architecture — FSD | ✅ 1/5 tareas |
| 8. Integration and Verification | 🔲 0/6 |

---

## Estructura Actual del Proyecto

```
food-store/
├── backend/                          ← FastAPI + SQLModel
│   ├── .env.example
│   └── app/
│       ├── __init__.py               ← [NUEVO]
│       ├── core/__init__.py           ← [NUEVO]
│       ├── db/__init__.py             ← [NUEVO]
│       ├── models/__init__.py         ← [NUEVO]
│       └── modules/                   ← [NUEVO]
│           ├── admin/       → 6 stubs
│           ├── auth/        → 6 stubs
│           ├── categorias/  → 6 stubs
│           ├── direcciones/ → 6 stubs
│           ├── ingredientes/→ 6 stubs    ← [NUEVO módulo]
│           ├── pagos/       → 6 stubs
│           ├── pedidos/     → 6 stubs
│           ├── productos/   → 6 stubs
│           ├── refreshtokens/→ 6 stubs
│           └── usuarios/    → 6 stubs
├── frontend/                         ← React + Vite + TypeScript
│   └── src/
│       ├── app/                      ← providers, routing
│       ├── assets/                   ← recursos estáticos
│       ├── entities/                 ← modelos + API
│       │   ├── api/                  ← Axios + QueryClient
│       │   └── types/                ← interfaces TS
│       ├── features/                 ← funcionalidades
│       │   ├── auth/store/           ← authStore
│       │   └── cart/store/           ← cartStore
│       ├── pages/                    ← [NUEVO] una página por ruta
│       ├── shared/                   ← [NUEVO] UI, utils, config
│       │   ├── config/
│       │   ├── ui/
│       │   └── utils/
│       └── widgets/                  ← [NUEVO] bloques compuestos
├── docs/                             ← documentación del sistema
│   ├── CHANGES.md                    ← mapa planificado de cambios
│   ├── Descripcion.txt               ← visión general
│   ├── Historias_de_usuario.txt      ← US-000 a US-076
│   ├── Integrador.txt                ← arquitectura + ERD
│   └── PROGRESO.md                   ← [NUEVO] este archivo
├── openspec/                         ← OPSX workflow
│   ├── changes/setup000/             ← change activo
│   └── specs/                        ← specs sincronizadas
├── AGENTS.md                         ← reglas de implementación
└── README.md                         ← setup instructions
```

---

## Próximos Pasos (Sprint 0)

1. ✅ ~~US-000a — Configuración del backend FastAPI~~
2. ✅ ~~US-000b — Modelos SQLModel, migraciones Alembic y seed data~~
3. 🔲 **US-000c** — Configuración del frontend (Vite, Tailwind, TanStack Query, Axios)
4. 🔲 **US-000d** — Patrones base (BaseRepository, Unit of Work, get_current_user, require_role)
5. 🔲 **US-000e** — Stores de Zustand (authStore, cartStore, paymentStore, uiStore)

---

*Este archivo se actualiza manualmente al completar cada historia de usuario o cambio significativo.*
