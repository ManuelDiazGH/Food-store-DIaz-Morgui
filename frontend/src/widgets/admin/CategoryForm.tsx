/** CategoryForm — Modal form for creating/editing categories. */
import { useState, useEffect, useMemo } from 'react'
import { FormField } from '@shared/ui/FormField'
import type { CategoriaTreeNode, CategoriaCreate, CategoriaUpdate } from '@entities/api/categorias'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CategoriaCreate | CategoriaUpdate) => void
  initialData?: { id: number; nombre: string; descripcion: string | null; padre_id: number | null } | null
  treeData: CategoriaTreeNode[]
}

/** Flatten tree into a list of (id, name, depth) for parent selector. */
function flattenTree(nodes: CategoriaTreeNode[], depth = 0): Array<{ id: number; nombre: string; depth: number }> {
  const result: Array<{ id: number; nombre: string; depth: number }> = []
  for (const node of nodes) {
    result.push({ id: node.id, nombre: node.nombre, depth })
    if (node.subcategorias) {
      result.push(...flattenTree(node.subcategorias, depth + 1))
    }
  }
  return result
}

/** Collect all descendant IDs of a node (including itself). */
function getDescendantIds(nodes: CategoriaTreeNode[], targetId: number): number[] {
  const result: number[] = []
  function findAndCollect(list: CategoriaTreeNode[]): boolean {
    for (const node of list) {
      if (node.id === targetId) {
        result.push(node.id)
        collectAll(node.subcategorias)
        return true
      }
      if (findAndCollect(node.subcategorias)) return true
    }
    return false
  }
  function collectAll(list: CategoriaTreeNode[]) {
    for (const node of list) {
      result.push(node.id)
      collectAll(node.subcategorias)
    }
  }
  findAndCollect(nodes)
  return result
}

export function CategoryForm({ open, onClose, onSubmit, initialData, treeData }: CategoryFormProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [padreId, setPadreId] = useState<number | null>(null)
  const [errors, setErrors] = useState<{ nombre?: string }>({})

  const isEditing = !!initialData

  // Exclude self and descendants from parent selector when editing
  const excludedIds = useMemo(() => {
    if (!initialData) return new Set<number>()
    return new Set(getDescendantIds(treeData, initialData.id))
  }, [initialData, treeData])

  const parentOptions = useMemo(() => {
    const flat = flattenTree(treeData)
    // Add "Sin padre" option and filter excluded
    return [
      { value: null, label: '— Sin padre (raíz) —' },
      ...flat
        .filter((item) => !excludedIds.has(item.id))
        .map((item) => ({
          value: item.id as number,
          label: `${'—'.repeat(item.depth + 1)} ${item.nombre}`,
        })),
    ]
  }, [treeData, excludedIds])

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre)
      setDescripcion(initialData.descripcion || '')
      setPadreId(initialData.padre_id)
    } else {
      setNombre('')
      setDescripcion('')
      setPadreId(null)
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
      const updateData: CategoriaUpdate = {}
      if (nombre !== (initialData?.nombre || '')) updateData.nombre = nombre.trim()
      if (descripcion !== (initialData?.descripcion || '')) updateData.descripcion = descripcion.trim() || null
      if (padreId !== initialData?.padre_id) updateData.padre_id = padreId
      onSubmit(updateData)
    } else {
      const createData: CategoriaCreate = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        padre_id: padreId,
      }
      onSubmit(createData)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Editar categoría' : 'Nueva categoría'}
        </h2>

        <form onSubmit={handleSubmit}>
          <FormField
            type="text"
            label="Nombre"
            value={nombre}
            onChange={setNombre}
            required
            error={errors.nombre}
            placeholder="Nombre de la categoría"
          />

          <FormField
            type="text"
            label="Descripción"
            value={descripcion}
            onChange={setDescripcion}
            placeholder="Descripción opcional"
          />

          <FormField
            type="select"
            label="Categoría padre"
            value={padreId}
            onChange={(val) => setPadreId(val as number | null)}
            options={parentOptions}
            placeholder="Seleccionar categoría padre..."
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
              {isEditing ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}