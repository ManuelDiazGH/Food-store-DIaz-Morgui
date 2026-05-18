import { useQuery } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import type { Ingrediente } from '@entities/types'

interface AllergenFilterProps {
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export function AllergenFilter({ selectedIds, onChange }: AllergenFilterProps) {
  const { data: ingredientes } = useQuery<Ingrediente[]>({
    queryKey: ['ingredientes', 'alergenos'],
    queryFn: async () => {
      const { data } = await api.get<Ingrediente[]>('/api/v1/ingredientes', {
        params: { esAlergeno: true },
      })
      return data.filter((i) => i.es_alergeno)
    },
  })

  function handleToggle(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const alergenos = ingredientes ?? []

  if (alergenos.length === 0) return null

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">
        Excluir alérgenos
      </label>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alergenos.map((ingr) => (
          <label key={ingr.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.includes(ingr.id)}
              onChange={() => handleToggle(ingr.id)}
              className="rounded border-stone-300 text-red-600 focus:ring-red-400"
            />
            <span className="text-sm text-stone-700">{ingr.nombre}</span>
          </label>
        ))}
      </div>
    </div>
  )
}