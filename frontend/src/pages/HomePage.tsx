import { Link } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/authStore'
import { ROUTES } from '@shared/config/routes'

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div>
      {/* Hero section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🍔 Food Store
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Los mejores productos alimenticios, directo a tu puerta.
          Frescos, variados y con la calidad que merecés.
        </p>
        <div className="flex items-center justify-center gap-4">
          {!isAuthenticated && (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Ingresá
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg border border-orange-600 hover:bg-orange-50 transition-colors"
              >
                Registrate
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link
              to={ROUTES.DASHBOARD}
              className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Ir a mi Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Categories placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {['🍕 Pizzas', '🥗 Ensaladas', '🍔 Hamburguesas', '🍰 Postres', '🥤 Bebidas', '🥖 Panadería'].map((cat) => (
          <div key={cat} className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <span className="text-4xl block mb-3">{cat.split(' ')[0]}</span>
            <h3 className="font-semibold text-gray-900 text-lg">{cat.split(' ')[1]}</h3>
            <p className="text-sm text-gray-400 mt-1">Próximamente</p>
          </div>
        ))}
      </div>
    </div>
  )
}