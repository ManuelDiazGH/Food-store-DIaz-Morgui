/** Tests para useOrderActions — FSM logic pure functions. */
import { describe, it, expect } from 'vitest'
import { getValidTransitions, getTransitionLabel, getTransitionColor } from '../useOrderActions'

describe('getValidTransitions', () => {
  it('should return EN_PREPARACION and CANCELADO for CONFIRMADO', () => {
    const transitions = getValidTransitions('CONFIRMADO')
    expect(transitions).toContain('EN_PREPARACION')
    expect(transitions).toContain('CANCELADO')
    expect(transitions).toHaveLength(2)
  })

  it('should return EN_CAMINO for EN_PREPARACION', () => {
    expect(getValidTransitions('EN_PREPARACION')).toEqual(['EN_CAMINO'])
  })

  it('should return ENTREGADO for EN_CAMINO', () => {
    expect(getValidTransitions('EN_CAMINO')).toEqual(['ENTREGADO'])
  })

  it('should return empty array for terminal states', () => {
    expect(getValidTransitions('ENTREGADO')).toEqual([])
    expect(getValidTransitions('CANCELADO')).toEqual([])
  })

  it('should return empty array for PENDIENTE (no direct transitions)', () => {
    expect(getValidTransitions('PENDIENTE')).toEqual([])
  })

  it('should return empty array for unknown state', () => {
    expect(getValidTransitions('UNKNOWN')).toEqual([])
  })
})

describe('getTransitionLabel', () => {
  it('should return correct labels for each state', () => {
    expect(getTransitionLabel('EN_PREPARACION')).toBe('Iniciar preparación')
    expect(getTransitionLabel('EN_CAMINO')).toBe('Marcar en camino')
    expect(getTransitionLabel('ENTREGADO')).toBe('Marcar entregado')
    expect(getTransitionLabel('CANCELADO')).toBe('Cancelar pedido')
  })

  it('should return the state itself for unknown states', () => {
    expect(getTransitionLabel('UNKNOWN')).toBe('UNKNOWN')
  })
})

describe('getTransitionColor', () => {
  it('should return correct color classes for each state', () => {
    expect(getTransitionColor('EN_PREPARACION')).toContain('bg-purple-600')
    expect(getTransitionColor('EN_CAMINO')).toContain('bg-cyan-600')
    expect(getTransitionColor('ENTREGADO')).toContain('bg-green-600')
    expect(getTransitionColor('CANCELADO')).toContain('bg-red-600')
  })

  it('should return default gray for unknown states', () => {
    expect(getTransitionColor('UNKNOWN')).toContain('bg-gray-600')
  })
})
