# Proposal — Sprint 1: Auth y Navegación

## Contexto

Sprint 0 está completo (38/39 tareas). El backend tiene auth funcional (register, login, refresh, logout, me, RBAC) y el frontend tiene la infraestructura base (Vite, React, TS, Tailwind, TanStack Query, Axios interceptor, Zustand stores). 

Las páginas y componentes visuales NO existen aún. El frontend es un placeholder sin routing ni UI funcional.

## Qué

Implementar **Sprint 1 completo**: EPIC 01 (Auth y Autorización) + EPIC 02 (Navegación y Layout Base).

### Historias incluidas

| Historia | Nombre | Qué implica |
|----------|--------|-------------|
| US-001 | Registro de cliente | Página de registro con formulario |
| US-002 | Login de usuario | Página de login con rate limiting 429 |
| US-003 | Refresh de token | Ya implementado en Axios interceptor, verificar |
| US-004 | Logout | Botón logout, limpieza de auth store |
| US-005 | Gestión de roles (RBAC) | Panel admin para asignar roles |
| US-006 | Protección de rutas por rol | Guards frontend (ProtectedRoute, RoleGuard) |
| US-066 | Token expirado | Ya implementado en Axios interceptor, verificar |
| US-067 | Errores global frontend | Toast system + Error boundary |
| US-073 | Rate limiting feedback | UI para errores 429 |
| US-075 | Navegación por rol | Navbar/Sidebar adaptada al rol |
| US-076 | Protección rutas frontend | React Router guards + redirect |

## Por qué

El backend de auth está completo (48 rutas API). El frontend necesita las páginas y navegación para que los usuarios puedan registrarse, loguearse y navegar la app según su rol. Sin Sprint 1, la app es funcionalmente inaccesible desde el navegador.

## Fuera de alcance

- Sprint 2+ (Categorías, Ingredientes, Productos, etc.)
- E2E tests con PostgreSQL (Sprint 0 tarea 8.2/8.3)
- Componentes de catálogo, carrito, pedidos, etc.