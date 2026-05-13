/** StockManager — Modal for managing product stock (increment/absolute). */
import { useState, useEffect } from 'react'
import type { StockUpdate } from '@entities/types'

interface StockManagerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: StockUpdate) => void
  currentStock: number
  productName: string
}

export function StockManager({ open, onClose, onSubmit, currentStock, productName }: StockManagerProps) {
  const [tipo, setTipo] = useState<'incremento' | 'absoluto'>('incremento')
  const [cantidad, setCantidad] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTipo('incremento')
      setCantidad('')
      setError('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(cantidad, 10)
    if (isNaN(num)) {
      setError('Ingrese un número válido')
      return
    }
    if (tipo === 'incremento' && num < 1) {
      setError('El incremento debe ser al menos 1')
      return
    }
    if (tipo === 'absoluto' && num < 0) {
      setError('El valor absoluto no puede ser negativo')
      return
    }
    setError('')
    onSubmit({ cantidad: num, tipo })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Gestionar Stock</h2>
        <p className="text-sm text-gray-600 mb-4">
          Producto: <span className="font-medium">{productName}</span>
          {' — '}
          Stock actual: <span className="font-medium">{currentStock}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Modo</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="incremento"
                  checked={tipo === 'incremento'}
                  onChange={() => setTipo('incremento')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Incremento</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="absoluto"
                  checked={tipo === 'absoluto'}
                  onChange={() => setTipo('absoluto')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Absoluto</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tipo === 'incremento' ? 'Cantidad a agregar' : 'Stock absoluto'}
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min={tipo === 'incremento' ? 1 : 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={tipo === 'incremento' ? 'Ej: 10' : 'Ej: 50'}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
