import { useState } from 'react'

interface TransitionModalProps {
  open: boolean
  estadoHasta: string
  onConfirm: (observacion?: string) => void
  onCancel: () => void
  isLoading?: boolean
}

const MODAL_LABELS: Record<string, { title: string; message: string; reasonLabel: string; reasonRequired: boolean }> = {
  EN_PREPARACION: {
    title: 'Iniciar preparación',
    message: '¿Estás seguro de que querés iniciar la preparación de este pedido?',
    reasonLabel: 'Observación (opcional)',
    reasonRequired: false,
  },
  EN_CAMINO: {
    title: 'Marcar en camino',
    message: '¿Estás seguro de que querés marcar este pedido como en camino?',
    reasonLabel: 'Observación (opcional)',
    reasonRequired: false,
  },
  ENTREGADO: {
    title: 'Marcar entregado',
    message: '¿Estás seguro de que querés marcar este pedido como entregado?',
    reasonLabel: 'Observación (opcional)',
    reasonRequired: false,
  },
  CANCELADO: {
    title: 'Cancelar pedido',
    message: '¿Estás seguro de que querés cancelar este pedido? Esta acción no se puede deshacer.',
    reasonLabel: 'Motivo de cancelación *',
    reasonRequired: true,
  },
}

export function TransitionModal({ open, estadoHasta, onConfirm, onCancel, isLoading }: TransitionModalProps) {
  const [observacion, setObservacion] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const config = MODAL_LABELS[estadoHasta] || {
    title: `Transicionar a ${estadoHasta}`,
    message: `¿Confirmás la transición a ${estadoHasta}?`,
    reasonLabel: 'Observación (opcional)',
    reasonRequired: false,
  }

  function handleConfirm() {
    if (config.reasonRequired && !observacion.trim()) {
      setError('El motivo es obligatorio para cancelar')
      return
    }
    setError('')
    onConfirm(observacion.trim() || undefined)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">{config.title}</h3>
        <p className="text-sm text-stone-600 mb-4">{config.message}</p>

        <div className="mb-4">
          <label htmlFor="observacion" className="block text-sm font-medium text-stone-700 mb-1">
            {config.reasonLabel}
          </label>
          <textarea
            id="observacion"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500"
            placeholder={config.reasonRequired ? 'Indicá el motivo...' : 'Opcional...'}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
