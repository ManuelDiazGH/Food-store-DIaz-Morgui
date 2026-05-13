/** IngredientForm — Modal form for creating/editing ingredients. */
import { useState, useEffect } from 'react'
import { FormField } from '@shared/ui/FormField'
import type { IngredienteCreate, IngredienteUpdate } from '@entities/api/ingredientes'

interface IngredientFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: IngredienteCreate | IngredienteUpdate) => void
  initialData?: { id: number; nombre: string; es_alergeno: boolean } | null
}

export function IngredientForm({ open, onClose, onSubmit, initialData }: IngredientFormProps) {
  const [nombre, setNombre] = useState('')
  const [esAlergeno, setEsAlergeno] = useState(false)
  const [errors, setErrors] = useState<{ nombre?: string }>({})

  const isEditing = !!initialData

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre)
      setEsAlergeno(initialData.es_alergeno)
    } else {
      setNombre('')
      setEsAlergeno(false)
    }
    setErrors({})
  }, [initialData, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { nombre?: string } = {}
    if (!nombre || nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre es obligatorio (mínimo 2 caracteres)'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (isEditing) {
      const updateData: IngredienteUpdate = {}
      if (nombre !== (initialData?.nombre || '')) updateData.nombre = nombre.trim()
      if (esAlergeno !== initialData?.es_alergeno) updateData.es_alergeno = esAlergeno
      onSubmit(updateData)
    } else {
      const createData: IngredienteCreate = {
        nombre: nombre.trim(),
        es_alergeno: esAlergeno,
      }
      onSubmit(createData)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Editar ingrediente' : 'Nuevo ingrediente'}
        </h2>

        <form onSubmit={handleSubmit}>
          <FormField
            type="text"
            label="Nombre"
            value={nombre}
            onChange={setNombre}
            required
            error={errors.nombre}
            placeholder="Nombre del ingrediente"
          />

          <FormField
            type="checkbox"
            label="Es alérgeno"
            value={esAlergeno}
            onChange={setEsAlergeno}
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Guardar cambios' : 'Crear ingrediente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}