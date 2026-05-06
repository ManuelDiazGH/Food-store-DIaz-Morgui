## Why

Food Store es un proyecto greenfield (documentación completa, código no implementado). Se requiere establecer la infraestructura base del proyecto para comenzar el desarrollo de las funcionalidades. Este cambio pone en marcha el Sprint 0: configuración del entorno, estructura de carpetas, dependencias y arquitectura base tanto del backend (FastAPI + SQLModel) como del frontend (React + TypeScript + Vite).

## What Changes

- **Backend**: Crear estructura de proyecto FastAPI con arquitectura feature-first (módulos: auth, usuarios, categorias, productos, pedidos, pagos, direcciones, admin, refreshtokens)
- **Backend**: Configurar SQLModel + PostgreSQL con Alembic para migraciones
- **Backend**: Implementar BaseRepository[T] genérico y Unit of Work pattern
- **Backend**: Configurar CORS, rate limiting con slowapi, y autenticación JWT con python-jose
- **Backend**: Crear seed data script (roles, estados de pedido, formas de pago, usuario admin)
- **Frontend**: Inicializar proyecto Vite + React + TypeScript
- **Frontend**: Configurar Tailwind CSS, TanStack Query, TanStack Form, Zustand, Axios
- **Frontend**: Estructura base Feature-Sliced Design (app, pages, widgets, features, entities, shared)
- **Shared**: Configurar archivos .env.example para backend y frontend
- **BREAKING**: N/A (proyecto nuevo, no hay cambios que romper)

## Capabilities

### New Capabilities
- `backend-setup`: Configuración inicial del backend FastAPI con arquitectura feature-first, SQLModel, Alembic, y módulos base
- `frontend-setup`: Configuración inicial del frontend con Vite, React, TypeScript, Tailwind CSS y Feature-Sliced Design
- `database-setup`: Configuración de PostgreSQL, migraciones con Alembic, y seed data inicial
- `auth-foundation`: Base de autenticación JWT, refresh tokens en BD, y rate limiting (preparado para US-001 a US-010)

### Modified Capabilities
(No hay capacidades existentes en `openspec/specs/` ya que es proyecto nuevo)

## Impact

- **Backend**: Nueva estructura de carpetas en `backend/app/modules/`, configuración de FastAPI, SQLModel models, Alembic migrations
- **Frontend**: Nueva estructura en `frontend/src/` con Feature-Sliced Design, configuración de Vite y Tailwind
- **Database**: Nueva base de datos PostgreSQL con esquema inicial (tablas de roles, estados, formas de pago)
- **Dependencies**: Instalación de paquetes Python (FastAPI, SQLModel, Alembic, python-jose, passlib, slowapi, mercadopago) y npm packages (React, TypeScript, Vite, Tailwind, TanStack Query, Zustand, Axios, recharts)
- **Development Environment**: Archivos `.env.example`, configuración de CORS, preparación para integración MercadoPago
