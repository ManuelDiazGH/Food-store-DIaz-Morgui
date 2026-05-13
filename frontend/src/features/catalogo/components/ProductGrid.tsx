import { useNavigate } from 'react-router-dom'
import { useProductos } from '@entities/api/productosApi'
import { ROUTES } from '@shared/config/routes'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  filters?: {
    categoria?: number
    busqueda?: string
    excluir_alergenos?: number[]
  }
}

export function ProductGrid({ filters = {} }: ProductGridProps) {
  const navigate = useNavigate()
  const { data, isLoading, error } = useProductos({ ...filters, limit: 20 })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Cargando productos...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error al cargar productos</div>
  }

  if (!data || data.items.length === 0) {
    return <div className="text-center py-12 text-gray-500">No se encontraron productos</div>
  }

  function handleCardClick(product: { id: number }) {
    navigate(ROUTES.PRODUCT_DETAIL.replace(':id', String(product.id)))
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.items.map((product) => (
          <ProductCard key={product.id} product={product} onClick={() => handleCardClick(product)} />
        ))}
      </div>
      {/* Pagination */}
      {data.total > data.limit && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded ${page === data.page ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}