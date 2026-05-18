import { Link } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/authStore'
import { ROUTES } from '@shared/config/routes'

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div>
      {/* Hero section */}
      <div className="text-center py-16">
        <div className="flex items-center justify-center mb-6">
          <span className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-bold">
            FS
          </span>
        </div>
        <h1 className="text-5xl font-bold text-stone-900 mb-4">
          Food Store
        </h1>
        <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
          Los mejores productos alimenticios, directo a tu puerta.
          Frescos, variados y con la calidad que merecés.
        </p>
        <div className="flex items-center justify-center gap-4">
          {!isAuthenticated && (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
              >
                Ingresá
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-6 py-3 bg-white text-brand-600 font-medium rounded-lg border border-brand-600 hover:bg-brand-50 transition-colors"
              >
                Registrate
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link
              to={ROUTES.DASHBOARD}
              className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Ir a mi Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Categories placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {['Pizzas', 'Ensaladas', 'Hamburguesas', 'Postres', 'Bebidas', 'Panadería'].map((cat) => (
          <div key={cat} className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-stone-400 text-lg font-bold">{cat[0]}</span>
            </div>
            <h3 className="font-semibold text-stone-900 text-lg">{cat}</h3>
            <p className="text-sm text-stone-400 mt-1">Próximamente</p>
          </div>
        ))}
      </div>
    </div>
  )
}