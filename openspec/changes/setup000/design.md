## Context

Food Store es un proyecto greenfield con documentación completa (Descripcion.txt, Integrador.txt, Historias_de_usuario.txt) pero **sin código implementado**. El stack está definido: FastAPI + SQLModel + PostgreSQL en el backend, React + TypeScript + Vite en el frontend.

La arquitectura requiere:
- **Backend**: Feature-First (cada módulo tiene su model, schema, repository, service, router)
- **Frontend**: Feature-Sliced Design (app, pages, widgets, features, entities, shared)
- **Patrones**: Unit of Work, BaseRepository[T], Snapshot Pattern, Audit Trail, FSM para pedidos

Este cambio (setup000) es el Sprint 0: infraestructura base para permitir el desarrollo de las historias de usuario (US-000 en adelante).

## Goals / Non-Goals

**Goals:**
- Inicializar proyecto backend FastAPI con estructura de carpetas feature-first
- Inicializar proyecto frontend Vite + React + TypeScript con Feature-Sliced Design
- Configurar SQLModel + PostgreSQL + Alembic para migraciones
- Implementar BaseRepository[T] genérico y Unit of Work pattern
- Configurar CORS, rate limiting (slowapi), y fundamentos de JWT auth
- Crear seed data (roles, estados de pedido, formas de pago, usuario admin)
- Configurar .env.example para ambos entornos
- Configurar Tailwind CSS, TanStack Query, Zustand, Axios en frontend

**Non-Goals:**
- Implementar lógica de negocio de las historias de usuario (US-000+)
- Crear componentes UI (login, catálogo, carrito, etc.)
- Configurar CI/CD
- Desplegar a producción
- Implementar webhooks de MercadoPago (solo preparar la estructura)

## Decisions

### 1. Estructura de módulos backend (Feature-First)
**Decisión**: Cada funcionalidad en su propia carpeta bajo `backend/app/modules/`
**Estructura por módulo**:
```
modulo/
├── model.py       ← SQLModel entities
├── schemas.py    ← Pydantic schemas (Create/Update/Read)
├── repository.py ← Hereda BaseRepository[T]
├── service.py    ← Lógica de negocio (stateless)
└── router.py    ← Endpoints HTTP
```
**Alternativas consideradas**:
- Estructura por capa (todos los models en una carpeta, todos los routers en otra) → Rechazada porque dificulta mantenimiento y escalabilidad
- Estructura hexagonal → Demasiado compleja para el alcance inicial

### 2. BaseRepository[T] y Unit of Work
**Decisión**: Implementar `BaseRepository[T]` genérico con operaciones CRUD comunes. Unit of Work gestiona transacciones atómicas.
**Rationale**: El proyecto requiere operaciones complejas (crear pedido + detalles + historial) que deben ser atómicas. El UoW garantiza commit/rollback automático.

### 3. Autenticación JWT + Refresh Token en BD
**Decisión**: Access token (30 min, HS256) + Refresh token (7 días, UUID v4, almacenado en BD)
**Rationale**: Permite revocación segura en logout y rotación de tokens. El refresh token en BD (tabla `refreshtokens`) permite invalidación inmediata.

### 4. Separación de estado frontend (Zustand vs TanStack Query)
**Decisión**: 
- **Zustand**: Estado del cliente (carrito, sesión auth, proceso de pago, UI)
- **TanStack Query**: Estado del servidor (productos, pedidos, datos remotos con caché)
**Rationale**: Mezclar ambos tipos en el mismo store es un error arquitectónico. Cada librería tiene un propósito específico.

### 5. Soft Delete en lugar de DELETE físico
**Decisión**: Campo `eliminado_en` (TIMESTAMPTZ) en entidades que lo requieran
**Rationale**: Requisito del proyecto para mantener trazabilidad y permitir "restauración" lógica.

### 6. Seed data obligatorio
**Decisión**: Script `app/db/seed.py` que crea:
- Roles: ADMIN, STOCK, PEDIDOS, CLIENT
- Estados de pedido: PENDIENTE, CONFIRMADO, EN_PREPARACIÓN, EN_CAMINO, ENTREGADO, CANCELADO
- Formas de pago: mercadopago, rapipago, pagofacil
- Usuario admin: admin@foodstore.com / admin123

## Risks / Trade-offs

- **[Risk]**: Configuración de CORS incorrecta → **Mitigation**: Configurar CORSMiddleware con origins específicos, no wildcard en producción
- **[Risk]**: Variables de entorno faltantes → **Mitigation**: Crear .env.example completo, validar con Pydantic Settings
- **[Risk]**: Migraciones Alembic fuera de sincronía → **Mitigation**: Usar `alembic revision --autogenerate` con cuidado, revisar cada migración generada
- **[Risk]**: Dependencias npm/python con vulnerabilidades → **Mitigation**: Usar versiones estables y actualizadas según Integrador.txt
- **[Trade-off]**: SQLModel es menos flexible que SQLAlchemy puro → Beneficio: menos código duplicado entre model y schema
- **[Trade-off]**: Feature-Sliced Design tiene curva de aprendizaje → Beneficio: escalabilidad y mantenibilidad a largo plazo
