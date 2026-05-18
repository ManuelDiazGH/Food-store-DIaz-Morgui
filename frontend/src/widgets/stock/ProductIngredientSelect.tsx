/** ProductIngredientSelect — Multi-select ingredients with removable toggle. */
import { useQuery } from '@tanstack/react-query'
import { getAllIngredients } from '@entities/api/ingredientes'

interface IngredientSelection {
  ingrediente_id: number
  es_removible: boolean
}

interface ProductIngredientSelectProps {
  selected: IngredientSelection[]
  onChange: (data: IngredientSelection[]) => void
}

export function ProductIngredientSelect({ selected, onChange }: ProductIngredientSelectProps) {
  const { data: ingredientes = [], isLoading } = useQuery({
    queryKey: ['ingredients', 'list'],
    queryFn: () => getAllIngredients(),
  })

  const isSelected = (id: number) => selected.some((s) => s.ingrediente_id === id)

  const getRemovible = (id: number) => selected.find((s) => s.ingrediente_id === id)?.es_removible ?? true

  const toggleIngredient = (id: number) => {
    if (isSelected(id)) {
      onChange(selected.filter((s) => s.ingrediente_id !== id))
    } else {
      // Default: removible (coincide con el seed y la expectativa del cliente
      // de poder pedir "sin X"). El admin lo desmarca para ingredientes fijos.
      onChange([...selected, { ingrediente_id: id, es_removible: true }])
    }
  }

  const toggleRemovible = (id: number) => {
    onChange(
      selected.map((s) =>
        s.ingrediente_id === id ? { ...s, es_removible: !s.es_removible } : s,
      ),
    )
  }

  if (isLoading) {
    return <div className="text-sm text-stone-400">Cargando ingredientes...</div>
  }

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-2">
      {ingredientes.length === 0 && (
        <p className="text-sm text-stone-400">No hay ingredientes disponibles</p>
      )}
      {ingredientes.map((ing) => (
        <div key={ing.id} className="flex items-center gap-2 py-1">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={isSelected(ing.id)}
              onChange={() => toggleIngredient(ing.id)}
              className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-brand-500"
            />
            <span className="text-sm text-stone-700">
              {ing.nombre}
              {ing.es_alergeno && (
                <span className="ml-1 text-xs text-red-500">(alérgeno)</span>
              )}
            </span>
          </label>
          {isSelected(ing.id) && (
            <label className="flex items-center gap-1 cursor-pointer text-xs text-stone-500">
              <input
                type="checkbox"
                checked={getRemovible(ing.id)}
                onChange={() => toggleRemovible(ing.id)}
                className="w-3 h-3 rounded border-stone-300 text-blue-600 focus:ring-brand-500"
              />
              Removible
            </label>
          )}
        </div>
      ))}
    </div>
  )
}
