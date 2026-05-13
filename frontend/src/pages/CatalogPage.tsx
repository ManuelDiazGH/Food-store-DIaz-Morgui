import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProductGrid } from '@features/catalogo/components/ProductGrid'
import { ProductDetail } from '@features/catalogo/components/ProductDetail'
import { ProductFilters } from '@features/catalogo/components/ProductFilters'
import { AllergenFilter } from '@features/catalogo/components/AllergenFilter'

export default function CatalogPage() {
  const { id } = useParams()
  const [filters, setFilters] = useState<{
    categoria?: number
    busqueda?: string
    excluir_alergenos?: number[]
  }>({})

  // If we have an ID param, show product detail
  if (id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductDetail productId={Number(id)} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Catálogo de Productos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
            <ProductFilters
              onFilterChange={setFilters}
              currentFilters={filters}
            />
            <AllergenFilter
              selectedIds={filters.excluir_alergenos ?? []}
              onChange={(ids) => setFilters({ ...filters, excluir_alergenos: ids.length > 0 ? ids : undefined })}
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="lg:col-span-3">
          <ProductGrid filters={filters} />
        </div>
      </div>
    </div>
  )
}