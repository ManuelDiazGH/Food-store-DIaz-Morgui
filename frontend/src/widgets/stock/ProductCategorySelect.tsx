/** ProductCategorySelect — Multi-select category checkboxes. */
import { useQuery } from '@tanstack/react-query'
import { getAllCategories } from '@entities/api/categorias'

interface ProductCategorySelectProps {
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export function ProductCategorySelect({ selectedIds, onChange }: ProductCategorySelectProps) {
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias', 'all'],
    queryFn: () => getAllCategories(),
  })

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (isLoading) {
    return <div className="text-sm text-stone-400">Cargando categorías...</div>
  }

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-2">
      {categorias.length === 0 && (
        <p className="text-sm text-stone-400">No hay categorías disponibles</p>
      )}
      {categorias.map((cat) => (
        <label key={cat.id} className="flex items-center gap-2 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={selectedIds.includes(cat.id)}
            onChange={() => toggle(cat.id)}
            className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-brand-500"
          />
          <span className="text-sm text-stone-700">{cat.nombre}</span>
        </label>
      ))}
    </div>
  )
}
