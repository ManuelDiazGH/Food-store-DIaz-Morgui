import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import { useAuthStore } from '@features/auth/store/authStore'
import { ROUTES } from '@shared/config/routes'
import type { CategoriaTreeNode } from '@entities/api/categorias'

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: categories = [] } = useQuery<CategoriaTreeNode[]>({
    queryKey: ['categories', 'tree', 'home'],
    queryFn: async () => {
      const { data } = await api.get<CategoriaTreeNode[]>('/api/v1/categorias/tree')
      return data
    },
  })

  // Solo categorías raíz (sin padre) para los cards principales.
  const rootCategories = categories.slice(0, 6)

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
          <Link
            to={ROUTES.CATALOG}
            className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Ver catálogo
          </Link>
          {!isAuthenticated && (
            <Link
              to={ROUTES.REGISTER}
              className="px-6 py-3 bg-white text-brand-600 font-medium rounded-lg border border-brand-600 hover:bg-brand-50 transition-colors"
            >
              Registrate
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to={ROUTES.DASHBOARD}
              className="px-6 py-3 bg-white text-brand-600 font-medium rounded-lg border border-brand-600 hover:bg-brand-50 transition-colors"
            >
              Ir a mi Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Categories — datos reales desde el backend */}
      {rootCategories.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-stone-900 mb-4 px-2">
            Categorías
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rootCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`${ROUTES.CATALOG}?categoria=${cat.id}`}
                className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-stone-400 text-lg font-bold">{cat.nombre[0]?.toUpperCase()}</span>
                </div>
                <h3 className="font-semibold text-stone-900 text-lg">{cat.nombre}</h3>
                {cat.descripcion && (
                  <p className="text-sm text-stone-400 mt-1 line-clamp-1">{cat.descripcion}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
