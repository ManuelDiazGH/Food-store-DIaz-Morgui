import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@app/Layout'
import { Spinner } from '@shared/ui/Spinner'
import { ProtectedRoute } from '@features/auth/guards/ProtectedRoute'
import { RoleGuard } from '@features/auth/guards/RoleGuard'
import { ROUTES } from '@shared/config/routes'

const HomePage = lazy(() => import('@pages/HomePage'))
const CatalogPage = lazy(() => import('@pages/CatalogPage'))
const ProductDetailPage = lazy(() => import('@pages/ProductDetailPage'))
const LoginPage = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@pages/DashboardPage'))
const ProfilePage = lazy(() => import('@pages/ProfilePage'))
const CartPage = lazy(() => import('@pages/CartPage'))
const CheckoutPage = lazy(() => import('@pages/CheckoutPage'))
const OrdersPage = lazy(() => import('@pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('@pages/OrderDetailPage'))
const AddressesPage = lazy(() => import('@pages/AddressesPage'))
const AdminUsersPage = lazy(() => import('@pages/admin/AdminUsersPage'))
const AdminDashboardPage = lazy(() => import('@pages/admin/AdminDashboardPage'))
const ProductsPage = lazy(() => import('@pages/stock/ProductsPage'))
const CategoriesPage = lazy(() => import('@pages/stock/CategoriesPage'))
const IngredientsPage = lazy(() => import('@pages/stock/IngredientsPage'))
const StockPage = lazy(() => import('@pages/stock/StockPage'))
const OrdersPanelPage = lazy(() => import('@pages/pedidos/OrdersPanelPage'))
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'))
const ForbiddenPage = lazy(() => import('@pages/ForbiddenPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: ROUTES.HOME, element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
      { path: ROUTES.CATALOG, element: <Suspense fallback={<PageLoader />}><CatalogPage /></Suspense> },
      { path: ROUTES.PRODUCT_DETAIL, element: <Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense> },
      { path: ROUTES.LOGIN, element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
      { path: ROUTES.REGISTER, element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.DASHBOARD, element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
          { path: ROUTES.PROFILE, element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
          { path: ROUTES.CART, element: <Suspense fallback={<PageLoader />}><CartPage /></Suspense> },
          { path: '/checkout', element: <Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense> },
          { path: ROUTES.ORDERS, element: <Suspense fallback={<PageLoader />}><OrdersPage /></Suspense> },
          { path: '/orders/:id', element: <Suspense fallback={<PageLoader />}><OrderDetailPage /></Suspense> },
          { path: ROUTES.ADDRESSES, element: <Suspense fallback={<PageLoader />}><AddressesPage /></Suspense> },
        ],
      },

      {
        element: <RoleGuard allowedRoles={['ADMIN']} />,
        children: [
          { path: ROUTES.ADMIN_USERS, element: <Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense> },
          { path: ROUTES.ADMIN_DASHBOARD, element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense> },
        ],
      },

      {
        element: <RoleGuard allowedRoles={['STOCK', 'ADMIN']} />,
        children: [
          { path: ROUTES.PRODUCTS, element: <Suspense fallback={<PageLoader />}><ProductsPage /></Suspense> },
          { path: ROUTES.CATEGORIES, element: <Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense> },
          { path: ROUTES.INGREDIENTS, element: <Suspense fallback={<PageLoader />}><IngredientsPage /></Suspense> },
          { path: ROUTES.STOCK, element: <Suspense fallback={<PageLoader />}><StockPage /></Suspense> },
        ],
      },

      {
        element: <RoleGuard allowedRoles={['PEDIDOS', 'ADMIN']} />,
        children: [
          { path: ROUTES.ORDERS_PANEL, element: <Suspense fallback={<PageLoader />}><OrdersPanelPage /></Suspense> },
        ],
      },

      { path: '/forbidden', element: <Suspense fallback={<PageLoader />}><ForbiddenPage /></Suspense> },
      { path: '*', element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense> },
    ],
  },
])