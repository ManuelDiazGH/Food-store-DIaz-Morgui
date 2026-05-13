# Design — Sprint 1: Auth y Navegación

## Arquitectura Frontend — Feature-Sliced Design (FSD)

La app ya tiene la estructura FSD base. Sprint 1 agrega:

```
frontend/src/
├── app/
│   ├── providers.tsx        ← (ya existe) QueryClientProvider
│   ├── router.tsx            ← NUEVO: React Router config
│   └── error-boundary.tsx    ← NUEVO: ErrorBoundary global
├── pages/
│   ├── LoginPage.tsx         ← NUEVO: US-002
│   ├── RegisterPage.tsx      ← NUEVO: US-001
│   ├── DashboardPage.tsx     ← NUEVO: US-075 (placeholder)
│   ├── CatalogPage.tsx       ← NUEVO: placeholder público
│   └── NotFoundPage.tsx      ← NUEVO: 404
├── widgets/
│   └── Navbar/
│       ├── Navbar.tsx         ← NUEVO: US-075
│       └── NavItem.tsx        ← NUEVO
├── features/
│   ├── auth/
│   │   ├── store/
│   │   │   └── authStore.ts   ← (ya existe)
│   │   ├── components/
│   │   │   ├── LoginForm.tsx  ← NUEVO: US-002
│   │   │   └── RegisterForm.tsx ← NUEVO: US-001
│   │   ├── hooks/
│   │   │   └── useAuth.ts    ← NUEVO: TanStack Query mutations
│   │   └── guards/
│   │       ├── ProtectedRoute.tsx  ← NUEVO: US-076
│   │       └── RoleGuard.tsx        ← NUEVO: US-006
│   └── cart/
│       └── store/
│           └── cartStore.ts  ← (ya existe)
├── entities/
│   ├── api/
│   │   ├── axios.ts           ← (ya existe) + agregar toast error handler
│   │   ├── queryClient.ts    ← (ya existe)
│   │   └── authApi.ts         ← NUEVO: TanStack Query hooks for auth
│   └── types/
│       └── index.ts           ← (ya existe)
├── shared/
│   ├── ui/
│   │   ├── Button.tsx         ← NUEVO
│   │   ├── Input.tsx          ← NUEVO
│   │   ├── Toast.tsx           ← NUEVO: US-067
│   │   ├── ToastProvider.tsx   ← NUEVO: US-067
│   │   └── Spinner.tsx        ← NUEVO
│   ├── utils/
│   │   └── errorHandler.ts    ← NUEVO: US-067
│   └── config/
│       └── routes.ts          ← NUEVO: constantes de rutas
├── App.tsx                    ← MODIFICAR: agregar RouterProvider
├── main.tsx                   ← (ya existe)
└── index.css                  ← MODIFICAR: agregar estilos de Toast y formularios
```

## Decisiones de diseño

### 1. Routing — React Router v6
- Usar `createBrowserRouter` con `RouterProvider`
- Rutas públicas: `/login`, `/register`, `/` (catálogo placeholder)
- Rutas protegidas: `/dashboard`, `/admin/*`
- Lazy loading por rol con `React.lazy()`

### 2. Auth Guards
- `ProtectedRoute`: verifica `isAuthenticated` del authStore, redirige a `/login`
- `RoleGuard`: verifica que el usuario tenga al menos uno de los roles requeridos, muestra 403 si no

### 3. Error Handling (US-067)
- **Toast system**: componente `Toast` con `ToastProvider` usando React context
- **Axios interceptor**: ya maneja 401, agregar manejo de 403, 404, 429, 500
- **Error Boundary**: componente React que captura errores de render

### 4. Rate Limiting (US-073)
- El Axios interceptor muestra toast con mensaje específico para 429
- Botón de login muestra error con countdown cuando hay rate limiting

### 5. Navbar por rol (US-075)
| Rol | Menú items |
|-----|-----------|
| No autenticado | Catálogo, Login, Registrarse |
| CLIENT | Catálogo, Mi Carrito, Mis Pedidos, Mi Perfil, Mis Direcciones |
| STOCK | Productos, Categorías, Ingredientes, Stock |
| PEDIDOS | Panel de Pedidos |
| ADMIN | Todos los anteriores + Usuarios, Métricas, Configuración |

### 6. Estado
- **Zustand** (cliente): authStore ya tiene tokens, user, isAuthenticated. Agregar acciones de login/register/logout.
- **TanStack Query** (servidor): mutaciones para register, login, logout. Queries para /auth/me.

### 7. API hooks — authApi.ts
```typescript
useLogin()    → mutation POST /auth/login
useRegister() → mutation POST /auth/register
useLogout()   → mutation POST /auth/logout
useRefresh()  → mutation POST /auth/refresh
useMe()       → query GET /auth/me
```

### 8. Tailwind CSS — Sin librería de componentes externa
- Componentes UI propios (Button, Input, Toast, Spinner)
- Tailwind para todo el styling
- Diseño responsive mobile-first
- Colores primarios: orange-600 (brand), gray-50 (fondo)

## Flujo de Auth

```
1. Usuario → /login → LoginForm → POST /auth/login
2. Success → authStore.setTokens() + authStore.setUser() →.navigateTo /dashboard
3. Error 401 → Toast "Credenciales incorrectas"
4. Error 429 → Toast "Demasiados intentos, espera X minutos"
5. Token expirado → Axios interceptor → auto refresh → reintentar
6. Refresh falla → clearAuth() → navigateTo /login
7. Logout → POST /auth/logout → clearAuth() → navigateTo /
```

## Estilos y UX

- Design system mínimo: Button (primary/secondary/danger), Input (text/email/password), Toast (success/error/warning/info)
- Formularios con validación en frontend (email, password min 8 chars, required)
- Layout: Navbar fija arriba, contenido centrado max-w-7xl, footer minimal
- Responsive: Navbar con hamburger menu en mobile