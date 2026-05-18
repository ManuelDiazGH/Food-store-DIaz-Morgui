export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CATALOG: '/catalogo',
  PRODUCT_DETAIL: '/productos/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
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

// ── Helpers para rutas paramétricas ─────────────────────────────────
export const productDetailPath = (id: number | string): string =>
  ROUTES.PRODUCT_DETAIL.replace(':id', String(id))

export const productEditPath = (id: number | string): string =>
  ROUTES.PRODUCT_EDIT.replace(':id', String(id))

export const orderDetailPath = (id: number | string): string =>
  ROUTES.ORDER_DETAIL.replace(':id', String(id))

export const orderPanelDetailPath = (id: number | string): string =>
  ROUTES.ORDERS_PANEL_DETAIL.replace(':id', String(id))