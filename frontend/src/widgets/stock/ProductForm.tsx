/** ProductForm — Modal form for creating/editing products. */
import { useState, useEffect } from 'react'
import { FormField } from '@shared/ui/FormField'
import { ProductCategorySelect } from './ProductCategorySelect'
import { ProductIngredientSelect } from './ProductIngredientSelect'
import type { ProductoDetalleRead } from '@entities/types'

export interface ProductFormData {
  nombre: string
  descripcion: string
  precio_base: number
  stock_cantidad: number
  imagen: string
  disponible: boolean
  categoria_ids: number[]
  ingredientes: Array<{ ingrediente_id: number; es_removible: boolean }>
}

interface ProductFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProductFormData) => void
  initialData?: ProductoDetalleRead | null
  loading?: boolean
}

export function ProductForm({ open, onClose, onSubmit, initialData, loading }: ProductFormProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [stockCantidad, setStockCantidad] = useState('')
  const [imagen, setImagen] = useState('')
  const [disponible, setDisponible] = useState(true)
  const [categoriaIds, setCategoriaIds] = useState<number[]>([])
  const [ingredientes, setIngredientes] = useState<Array<{ ingrediente_id: number; es_removible: boolean }>>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!initialData

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre)
      setDescripcion(initialData.descripcion ?? '')
      setPrecioBase(String(initialData.precio_base))
      setStockCantidad(String(0))
      setImagen(initialData.imagen ?? '')
      setDisponible(initialData.disponible)
      setCategoriaIds(initialData.categorias?.map((c) => c.id) ?? [])
      setIngredientes(
        initialData.ingredientes?.map((i) => ({
          ingrediente_id: i.id,
          es_removible: i.es_removible,
        })) ?? [],
      )
    } else {
      setNombre('')
      setDescripcion('')
      setPrecioBase('')
      setStockCantidad('')
      setImagen('')
      setDisponible(true)
      setCategoriaIds([])
      setIngredientes([])
    }
    setErrors({})
  }, [initialData, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!nombre || nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre es obligatorio (mínimo 2 caracteres)'
    }
    const precio = parseFloat(precioBase)
    if (isNaN(precio) || precio <= 0) {
      newErrors.precio_base = 'El precio debe ser un número positivo'
    }
    if (!isEditing) {
      const stock = parseInt(stockCantidad, 10)
      if (isNaN(stock) || stock < 0) {
        newErrors.stock_cantidad = 'El stock debe ser un número válido'
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio_base: precio,
      stock_cantidad: isEditing ? 0 : parseInt(stockCantidad, 10),
      imagen: imagen.trim(),
      disponible,
      categoria_ids: categoriaIds,
      ingredientes,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <form onSubmit={handleSubmit}>
          <FormField
            type="text"
            label="Nombre"
            value={nombre}
            onChange={setNombre}
            required
            error={errors.nombre}
            placeholder="Nombre del producto"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              type="text"
              label="Precio Base"
              value={precioBase}
              onChange={setPrecioBase}
              required
              error={errors.precio_base}
              placeholder="0.00"
            />
            {!isEditing && (
              <FormField
                type="text"
                label="Stock Cantidad"
                value={stockCantidad}
                onChange={setStockCantidad}
                required
                error={errors.stock_cantidad}
                placeholder="0"
              />
            )}
          </div>

          <FormField
            type="text"
            label="Imagen URL"
            value={imagen}
            onChange={setImagen}
            placeholder="https://ejemplo.com/imagen.jpg"
          />

          <FormField
            type="checkbox"
            label="Disponible"
            value={disponible}
            onChange={setDisponible}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categorías
            </label>
            <ProductCategorySelect
              selectedIds={categoriaIds}
              onChange={setCategoriaIds}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredientes
            </label>
            <ProductIngredientSelect
              selected={ingredientes}
              onChange={setIngredientes}
            />
          </div>

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
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
