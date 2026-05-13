# Tasks — Sprint 1: Auth y Navegación

## Bloque 1: Infraestructura Frontend (Routing, Guards, Error Handling)

- [x] 1.1 Instalar react-router-dom (ya en package.json) y crear `shared/config/routes.ts` con constantes de rutas
- [x] 1.2 Crear `app/router.tsx` con createBrowserRouter — rutas públicas y protegidas
- [x] 1.3 Crear `features/auth/guards/ProtectedRoute.tsx` — verifica isAuthenticated, redirige a /login
- [x] 1.4 Crear `features/auth/guards/RoleGuard.tsx` — verifica roles del usuario, muestra 403 si no tiene permiso
- [x] 1.5 Crear `shared/ui/Toast.tsx` + `ToastProvider.tsx` — sistema de notificaciones (success/error/warning/info)
- [x] 1.6 Crear `shared/utils/errorHandler.ts` — mapeo de códigos HTTP a mensajes en español (400, 401, 403, 404, 429, 500)
- [x] 1.7 Mejorar `entities/api/axios.ts` — interceptar 403, 404, 429, 500 y mostrar toast con mensaje específico (US-067, US-073)
- [x] 1.8 Crear `app/error-boundary.tsx` — ErrorBoundary global para errores de render
- [x] 1.9 Crear `shared/ui/Button.tsx` — componente reutilizable (primary/secondary/danger, sizes, loading)
- [x] 1.10 Crear `shared/ui/Input.tsx` — componente reutilizable con label, error, tipo text/email/password
- [x] 1.11 Crear `shared/ui/Spinner.tsx` — indicador de carga

## Bloque 2: Auth API Hooks y Auth Store mejorado

- [x] 2.1 Crear `entities/api/authApi.ts` — TanStack Query hooks: useLogin, useRegister, useLogout, useMe mutation/query
- [x] 2.2 Mejorar `features/auth/store/authStore.ts` — agregar acción logout() que llame a clearAuth() y limpie localStorage
- [x] 2.3 Actualizar `app/providers.tsx` — envolver con ToastProvider y BrowserRouter

## Bloque 3: Páginas de Auth (US-001, US-002, US-004)

- [x] 3.1 Crear `features/auth/components/LoginForm.tsx` — formulario con email/password, validación, manejo de errores, navigate a /dashboard on success
- [x] 3.2 Crear `features/auth/components/RegisterForm.tsx` — formulario con nombre/email/password/teléfono, validación (email, password min 8), manejo de errores
- [x] 3.3 Crear `pages/LoginPage.tsx` — wrapper con layout centrado + LoginForm
- [x] 3.4 Crear `pages/RegisterPage.tsx` — wrapper con layout centrado + RegisterForm
- [x] 3.5 Crear `pages/NotFoundPage.tsx` — 404 con link a home
- [x] 3.6 Crear `pages/DashboardPage.tsx` — placeholder para dashboard (accesible por cualquier rol autenticado)
- [x] 3.7 Crear `pages/CatalogPage.tsx` — placeholder para catálogo (ruta pública)

## Bloque 4: Navegación por Rol (US-075, US-076)

- [x] 4.1 Crear `widgets/Navbar/Navbar.tsx` — barra de navegación responsive con menú según rol del usuario
- [x] 4.2 Crear `widgets/Navbar/NavItem.tsx` — item de navegación con icono y texto
- [x] 4.3 Implementar lógica de menú por rol en Navbar (CLIENT, STOCK, PEDIDOS, ADMIN, no autenticado)
- [x] 4.4 Agregar botón de logout en Navbar (US-004)
- [x] 4.5 Actualizar `App.tsx` con layout: Navbar + Outlet para contenido

## Bloque 5: Admin RBAC (US-005)

- [x] 5.1 Crear `entities/api/userApi.ts` — TanStack Query hooks para usuarios (list, update, assignRole)
- [x] 5.2 Crear `pages/AdminUsersPage.tsx` — panel de administración de usuarios con tabla y asignación de roles
- [x] 5.3 Crear `features/auth/components/RoleAssignForm.tsx` — formulario para asignar roles a usuarios (solo ADMIN)

## Bloque 6: Integración y Verificación

- [x] 6.1 Verificar que todas las rutas públicas funcionan sin auth (/, /login, /register)
- [x] 6.2 Verificar que rutas protegidas redirigen a /login si no autenticado
- [x] 6.3 Verificar que RoleGuard muestra 403 para roles insuficientes
- [x] 6.4 Verificar que login/register/logout funcionan con el backend
- [x] 6.5 Verificar que el token refresh se maneja automáticamente en 401
- [x] 6.6 Verificar que los errores 429 muestran mensaje de rate limiting
- [x] 6.7 Verificar que el navbar cambia según el rol del usuario
- [x] 6.8 `npm run build` exitoso sin errores