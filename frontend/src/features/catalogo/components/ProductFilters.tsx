import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import type { CategoriaTreeNode } from '@entities/api/categorias'

interface ProductFiltersProps {
  onFilterChange: (filters: { categoria?: number; busqueda?: string; excluir_alergenos?: number[] }) => void
  currentFilters: { categoria?: number; busqueda?: string; excluir_alergenos?: number[] }
}

export function ProductFilters({ onFilterChange, currentFilters }: ProductFiltersProps) {
  const [search, setSearch] = useState(currentFilters.busqueda ?? '')
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(currentFilters.categoria)

  const { data: categories } = useQuery<CategoriaTreeNode[]>({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      const { data } = await api.get<CategoriaTreeNode[]>('/api/v1/categorias/tree')
      return data
    },
  })

  function flattenCategories(nodes: CategoriaTreeNode[], level = 0): Array<{ id: number; nombre: string; level: number }> {
    const result: Array<{ id: number; nombre: string; level: number }> = []
    for (const node of nodes) {
      result.push({ id: node.id, nombre: node.nombre, level })
      if (node.subcategorias?.length) {
        result.push(...flattenCategories(node.subcategorias, level + 1))
      }
    }
    return result
  }

  const flatCategories = categories ? flattenCategories(categories) : []

  function handleSearchChange(value: string) {
    setSearch(value)
    onFilterChange({ ...currentFilters, busqueda: value || undefined })
  }

  function handleCategoryChange(id: number | undefined) {
    setSelectedCategory(id)
    onFilterChange({ ...currentFilters, categoria: id })
  }

  function handleClearFilters() {
    setSearch('')
    setSelectedCategory(undefined)
    onFilterChange({ busqueda: undefined, categoria: undefined, excluir_alergenos: currentFilters.excluir_alergenos })
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Category filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select
          value={selectedCategory ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">Todas las categorías</option>
          {flatCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {'  '.repeat(cat.level)}{cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Clear filters */}
      {(currentFilters.busqueda || currentFilters.categoria) && (
        <button
          onClick={handleClearFilters}
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}