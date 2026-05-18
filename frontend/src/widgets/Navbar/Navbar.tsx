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
}

const CLIENT_ITEMS: MenuItem[] = [
  { to: ROUTES.HOME, label: 'Catálogo' },
  { to: ROUTES.CART, label: 'Carrito' },
  { to: ROUTES.ORDERS, label: 'Pedidos' },
  { to: ROUTES.PROFILE, label: 'Perfil' },
  { to: ROUTES.ADDRESSES, label: 'Direcciones' },
]

const STOCK_ITEMS: MenuItem[] = [
  { to: ROUTES.PRODUCTS, label: 'Productos' },
  { to: ROUTES.CATEGORIES, label: 'Categorías' },
  { to: ROUTES.INGREDIENTS, label: 'Ingredientes' },
  { to: ROUTES.STOCK, label: 'Stock' },
]

const PEDIDOS_ITEMS: MenuItem[] = [
  { to: ROUTES.ORDERS_PANEL, label: 'Panel' },
]

const ADMIN_ITEMS: MenuItem[] = [
  { to: ROUTES.ADMIN_USERS, label: 'Usuarios' },
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard' },
]

const UNAUTH_ITEMS: MenuItem[] = [
  { to: ROUTES.HOME, label: 'Catálogo' },
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
    ADMIN:   'bg-red-50 text-red-700 ring-red-200',
    STOCK:   'bg-blue-50 text-blue-700 ring-blue-200',
    PEDIDOS: 'bg-brand-50 text-brand-700 ring-brand-200',
    CLIENT:  'bg-stone-100 text-stone-600 ring-stone-200',
  }
  return (
    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ${styles[role]}`}>
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 text-lg font-bold text-stone-900 hover:text-brand-600 transition-colors tracking-tight"
          >
            <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
              FS
            </span>
            <span className="hidden sm:inline">Food Store</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {isAuthenticated
              ? menuItems.map((item) => (
                  <NavItem key={item.to} to={item.to}>
                    <span className="relative inline-flex items-center">
                      {item.label}
                      {item.to === ROUTES.CART && cartItemCount > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-bold text-white bg-brand-600 rounded-full">
                          {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                      )}
                    </span>
                  </NavItem>
                ))
              : UNAUTH_ITEMS.map((item) => (
                  <NavItem key={item.to} to={item.to}>
                    {item.label}
                  </NavItem>
                ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-sm font-bold ring-1 ring-brand-200">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.nombre}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-stone-100 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-sm font-medium text-stone-900">{user.nombre}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
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
                <NavItem to={ROUTES.LOGIN}>Ingresar</NavItem>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
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

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-0.5 border-t border-stone-100 bg-white">
          {isAuthenticated
            ? menuItems.map((item) => (
                <NavItem key={item.to} to={item.to}>
                  <span className="relative inline-flex items-center">
                    {item.label}
                    {item.to === ROUTES.CART && cartItemCount > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-bold text-white bg-brand-600 rounded-full">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </span>
                </NavItem>
              ))
            : UNAUTH_ITEMS.map((item) => (
                <NavItem key={item.to} to={item.to}>
                  {item.label}
                </NavItem>
              ))}

          {isAuthenticated && user && (
            <div className="pt-2 border-t border-stone-100 mt-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-stone-900">{user.nombre}</p>
                <p className="text-xs text-stone-500">{user.email}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={logout.isPending}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {logout.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-stone-100 mt-2 flex flex-col gap-2">
              <NavItem to={ROUTES.LOGIN}>Ingresar</NavItem>
              <Link
                to={ROUTES.REGISTER}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
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
