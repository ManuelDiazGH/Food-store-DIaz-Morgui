/** StateTransitionButton — Contextual button for valid FSM transitions.

Shows only when there are valid next states for the current order status.
For CANCELADO, also shown for PENDIENTE (gestor can cancel from there too).
 */
import { getValidTransitions, getTransitionLabel, getTransitionColor } from '../hooks/useOrderActions'

interface StateTransitionButtonProps {
  estadoActual: string
  estadoHasta: string
  onClick: (estadoHasta: string) => void
  disabled?: boolean
}

export function StateTransitionButton({ estadoActual, estadoHasta, onClick, disabled }: StateTransitionButtonProps) {
  const validTransitions = getValidTransitions(estadoActual)

  // Cancel button also shows for PENDIENTE
  const isCancel = estadoHasta === 'CANCELADO'
  const isAllowed = validTransitions.includes(estadoHasta) || (isCancel && estadoActual === 'PENDIENTE')

  if (!isAllowed) return null

  return (
    <button
      onClick={() => onClick(estadoHasta)}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getTransitionColor(estadoHasta)}`}
    >
      {getTransitionLabel(estadoHasta)}
    </button>
  )
}
