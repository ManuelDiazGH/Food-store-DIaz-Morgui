import { useState, useEffect } from 'react'
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
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when filters change (e.g., category or search)
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.categoria, filters.busqueda, filters.excluir_alergenos])

  const { data, isLoading, error } = useProductos({ ...filters, page: currentPage, limit: 20 })

  if (isLoading) {
    return <div className="text-center py-12 text-stone-400">Cargando productos...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error al cargar productos</div>
  }

  if (!data || data.items.length === 0) {
    return <div className="text-center py-12 text-stone-500">No se encontraron productos</div>
  }

  function handleCardClick(product: { id: number }) {
    navigate(ROUTES.PRODUCT_DETAIL.replace(':id', String(product.id)))
  }

  function getPageRange(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (current > 3) pages.push('...')
    for (let p = Math.max(2, current - 2); p <= Math.min(total - 1, current + 2); p++) {
      pages.push(p)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
    return pages
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
          {getPageRange(data.page, Math.ceil(data.total / data.limit)).map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-1 text-stone-400 select-none">...</span>
            ) : (
              <button
                key={page}
                className={`px-3 py-1 rounded ${page === data.page ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}