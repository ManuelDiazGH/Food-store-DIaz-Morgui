import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/authStore'
import { useLogout } from '@entities/api/authApi'
import { useCartStore } from '@features/cart/store/cartStore'
import { NavItem } from './NavItem'
import { ROUTES } from '@shared/config/routes'
import type { RolCodigo } from '@entities/types'

interface MenuItem {
  to: string
  label: string
  icon: string
}

const CLIENT_ITEMS: MenuItem[] = [
  { to: ROUTES.HOME, label: 'Catálogo', icon: '📦' },
  { to: ROUTES.CART, label: 'Mi Carrito', icon: '🛒' },
  { to: ROUTES.ORDERS, label: 'Mis Pedidos', icon: '📋' },
  { to: ROUTES.PROFILE, label: 'Mi Perfil', icon: '👤' },
  { to: ROUTES.ADDRESSES, label: 'Mis Direcciones', icon: '📍' },
]

const STOCK_ITEMS: MenuItem[] = [
  { to: ROUTES.PRODUCTS, label: 'Productos', icon: '🍔' },
  { to: ROUTES.CATEGORIES, label: 'Categorías', icon: '🗂️' },
  { to: ROUTES.INGREDIENTS, label: 'Ingredientes', icon: '🥬' },
  { to: ROUTES.STOCK, label: 'Stock', icon: '📦' },
]

const PEDIDOS_ITEMS: MenuItem[] = [
  { to: ROUTES.ORDERS_PANEL, label: 'Panel de Pedidos', icon: '📋' },
]

const ADMIN_ITEMS: MenuItem[] = [
  { to: ROUTES.ADMIN_USERS, label: 'Usuarios', icon: '👥' },
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard Admin', icon: '📊' },
]

const UNAUTH_ITEMS: MenuItem[] = [
  { to: ROUTES.HOME, label: 'Catálogo', icon: '📦' },
]

function getMenuItems(roles: RolCodigo[]): MenuItem[] {
  if (roles.length === 0) return UNAUTH_ITEMS

  const items: MenuItem[] = []

  if (roles.includes('CLIENT') || roles.includes('ADMIN')) {
    items.push(...CLIENT_ITEMS)
  }
  if (roles.includes('STOCK') || roles.includes('ADMIN')) {
    items.push(...STOCK_ITEMS)
  }
  if (roles.includes('PEDIDOS') || roles.includes('ADMIN')) {
    items.push(...PEDIDOS_ITEMS)
  }
  if (roles.includes('ADMIN')) {
    items.push(...ADMIN_ITEMS)
  }

  return items.length > 0 ? items : UNAUTH_ITEMS
}

function RoleBadge({ role }: { role: RolCodigo }) {
  const styles: Record<RolCodigo, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    STOCK: 'bg-blue-100 text-blue-700',
    PEDIDOS: 'bg-green-100 text-green-700',
    CLIENT: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded ${styles[role]}`}>
      {role}
    </span>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef<HTMLDivElement>(null)

  const roles: RolCodigo[] = (user?.roles as RolCodigo[]) ?? []
  const menuItems = getMenuItems(roles)

  // Reactive cart count (only re-renders when items array changes)
  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.cantidad, 0))

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate(ROUTES.HOME)
      },
    })
    setProfileOpen(false)
    setMobileOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <span className="text-2xl">🍔</span>
            <span className="hidden sm:inline">Food Store</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated
              ? menuItems.map((item) => (
                  <NavItem key={item.to} to={item.to} icon={item.icon}>
                    <span className="relative inline-flex items-center">
                      {item.label}
                      {item.to === ROUTES.CART && cartItemCount > 0 ? (
                        <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-orange-600 rounded-full">
                          {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                      ) : null}
                    </span>
                  </NavItem>
                ))
              : UNAUTH_ITEMS.map((item) => (
                  <NavItem key={item.to} to={item.to} icon={item.icon}>
                    {item.label}
                  </NavItem>
                ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.nombre}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={logout.isPending}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {logout.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavItem to={ROUTES.LOGIN} icon="🔑">
                  Ingresar
                </NavItem>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1 border-t border-gray-100 bg-white">
          {isAuthenticated
            ? menuItems.map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon}>
                  <span className="relative inline-flex items-center">
                    {item.label}
                    {item.to === ROUTES.CART && cartItemCount > 0 ? (
                      <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-orange-600 rounded-full">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    ) : null}
                  </span>
                </NavItem>
              ))
            : UNAUTH_ITEMS.map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon}>
                  {item.label}
                </NavItem>
              ))}

          {isAuthenticated && user ? (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={logout.isPending}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {logout.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-100 mt-2 flex flex-col gap-2">
              <NavItem to={ROUTES.LOGIN} icon="🔑">
                Ingresar
              </NavItem>
              <Link
                to={ROUTES.REGISTER}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}