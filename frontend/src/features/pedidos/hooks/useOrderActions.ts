/** useOrderActions — Mutation hooks for order state transitions (FSM). */
import { useTransicionarEstado } from '@entities/api/pedidosApi'

/**
 * Returns the set of valid next states for a given current state.
 * Matches the FSM defined in PedidoService (backend).
 *
 * Cualquier estado no terminal puede cancelarse — lo que evita que el operador
 * vea botones que el backend va a rechazar.
 */
export function getValidTransitions(estadoActual: string): string[] {
  const transitions: Record<string, string[]> = {
    PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
    CONFIRMADO: ['EN_PREPARACION', 'CANCELADO'],
    EN_PREPARACION: ['EN_CAMINO', 'CANCELADO'],
    EN_CAMINO: ['ENTREGADO'],
  }
  return transitions[estadoActual] ?? []
}

/**
 * Returns a human-readable label for a transition button.
 */
export function getTransitionLabel(estadoHasta: string): string {
  const labels: Record<string, string> = {
    EN_PREPARACION: 'Iniciar preparación',
    EN_CAMINO: 'Marcar en camino',
    ENTREGADO: 'Marcar entregado',
    CANCELADO: 'Cancelar pedido',
  }
  return labels[estadoHasta] ?? estadoHasta
}

/**
 * Returns the CSS color class for a transition button.
 */
export function getTransitionColor(estadoHasta: string): string {
  const colors: Record<string, string> = {
    EN_PREPARACION: 'bg-purple-600 hover:bg-purple-700',
    EN_CAMINO: 'bg-cyan-600 hover:bg-cyan-700',
    ENTREGADO: 'bg-green-600 hover:bg-green-700',
    CANCELADO: 'bg-red-600 hover:bg-red-700',
  }
  return colors[estadoHasta] ?? 'bg-gray-600 hover:bg-gray-700'
}

export function useOrderActions(pedidoId: number) {
  return useTransicionarEstado(pedidoId)
}

export type { EstadoUpdateRequest } from '@entities/api/pedidosApi'
