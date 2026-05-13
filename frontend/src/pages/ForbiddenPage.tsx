import { Link } from 'react-router-dom'
import { ROUTES } from '@shared/config/routes'

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-8xl font-bold text-gray-200 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Acceso denegado</h2>
      <p className="text-gray-600 mb-8">
        No tenés permisos para acceder a esta página.
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="inline-block rounded-lg bg-orange-600 px-6 py-3 text-white font-medium hover:bg-orange-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}