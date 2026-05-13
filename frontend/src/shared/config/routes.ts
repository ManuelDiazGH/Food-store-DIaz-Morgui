export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CATALOG: '/catalogo',
  PRODUCT_DETAIL: '/productos/:id',
  CART: '/cart',
  ORDERS: '/orders',
  PROFILE: '/perfil',
  ADDRESSES: '/addresses',
  ORDERS_PANEL: '/orders-panel',
  ADMIN_USERS: '/admin/users',
  ADMIN_DASHBOARD: '/admin/dashboard',
  PRODUCTS: '/stock/productos',
  PRODUCT_CREATE: '/stock/productos/nuevo',
  PRODUCT_EDIT: '/stock/productos/:id/editar',
  CATEGORIES: '/stock/categorias',
  INGREDIENTS: '/stock/ingredientes',
  STOCK: '/stock',
  ORDERS_PANEL_DETAIL: '/orders-panel/:id',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]