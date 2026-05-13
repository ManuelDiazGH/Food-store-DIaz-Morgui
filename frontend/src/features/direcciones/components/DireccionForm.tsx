import { useState, type FormEvent } from 'react'
import type { DireccionEntrega } from '@entities/types'

interface DireccionFormData {
  alias: string
  linea1: string
  linea2: string
  ciudad: string
  cp: string
  es_principal: boolean
}

interface DireccionFormProps {
  initialData?: DireccionEntrega
  onSubmit: (data: DireccionFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function DireccionForm({ initialData, onSubmit, onCancel, isLoading }: DireccionFormProps) {
  const [alias, setAlias] = useState(initialData?.alias ?? '')
  const [linea1, setLinea1] = useState(initialData?.linea1 ?? '')
  const [linea2, setLinea2] = useState(initialData?.linea2 ?? '')
  const [ciudad, setCiudad] = useState(initialData?.ciudad ?? '')
  const [cp, setCp] = useState(initialData?.cp ?? '')
  const [esPrincipal, setEsPrincipal] = useState(initialData?.es_principal ?? false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!linea1.trim()) newErrors.linea1 = 'La calle y número son obligatorios'
    if (!ciudad.trim()) newErrors.ciudad = 'La ciudad es obligatoria'
    if (!cp.trim()) newErrors.cp = 'El código postal es obligatorio'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      alias: alias.trim() || '',
      linea1: linea1.trim(),
      linea2: linea2.trim() || '',
      ciudad: ciudad.trim(),
      cp: cp.trim(),
      es_principal: esPrincipal,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-1">
          Alias <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          id="alias"
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Ej: Casa, Trabajo, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
        />
      </div>

      <div>
        <label htmlFor="linea1" className="block text-sm font-medium text-gray-700 mb-1">
          Calle y número *
        </label>
        <input
          id="linea1"
          type="text"
          value={linea1}
          onChange={(e) => setLinea1(e.target.value)}
          placeholder="Ej: Av. Siempre Viva 123"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm ${
            errors.linea1 ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.linea1 && <p className="text-xs text-red-500 mt-1">{errors.linea1}</p>}
      </div>

      <div>
        <label htmlFor="linea2" className="block text-sm font-medium text-gray-700 mb-1">
          Piso / Depto <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          id="linea2"
          type="text"
          value={linea2}
          onChange={(e) => setLinea2(e.target.value)}
          placeholder="Ej: Piso 3, Depto B"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad *
          </label>
          <input
            id="ciudad"
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: Buenos Aires"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm ${
              errors.ciudad ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.ciudad && <p className="text-xs text-red-500 mt-1">{errors.ciudad}</p>}
        </div>
        <div>
          <label htmlFor="cp" className="block text-sm font-medium text-gray-700 mb-1">
            Código Postal *
          </label>
          <input
            id="cp"
            type="text"
            value={cp}
            onChange={(e) => setCp(e.target.value)}
            placeholder="Ej: 1425"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm ${
              errors.cp ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.cp && <p className="text-xs text-red-500 mt-1">{errors.cp}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="es_principal"
          type="checkbox"
          checked={esPrincipal}
          onChange={(e) => setEsPrincipal(e.target.checked)}
          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
        />
        <label htmlFor="es_principal" className="text-sm text-gray-700">
          Establecer como dirección principal
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Agregar dirección'}
        </button>
      </div>
    </form>
  )
}
