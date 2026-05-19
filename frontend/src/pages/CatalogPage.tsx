import { useState } from 'react'
import { ProductGrid } from '@features/catalogo/components/ProductGrid'
import { ProductFilters } from '@features/catalogo/components/ProductFilters'
import { AllergenFilter } from '@features/catalogo/components/AllergenFilter'

export default function CatalogPage() {
  const [filters, setFilters] = useState<{
    categoria?: number
    busqueda?: string
    excluir_alergenos?: number[]
  }>({})

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Catálogo de Productos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-stone-200 p-4 space-y-6">
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