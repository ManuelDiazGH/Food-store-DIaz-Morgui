export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CATALOG: '/catalog',
  CART: '/cart',
  ORDERS: '/orders',
  PROFILE: '/profile',
  ADDRESSES: '/addresses',
  ORDERS_PANEL: '/orders-panel',
  ADMIN_USERS: '/admin/users',
  ADMIN_DASHBOARD: '/admin/dashboard',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  INGREDIENTS: '/ingredients',
  STOCK: '/stock',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]