/** Tests para StateTransitionButton component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StateTransitionButton } from '../StateTransitionButton'

describe('StateTransitionButton', () => {
  it('should render button for valid transition', () => {
    render(
      <StateTransitionButton
        estadoActual="CONFIRMADO"
        estadoHasta="EN_PREPARACION"
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Iniciar preparación')).toBeInTheDocument()
  })

  it('should not render button for invalid transition (ENTREGADO is terminal)', () => {
    const { container } = render(
      <StateTransitionButton
        estadoActual="ENTREGADO"
        estadoHasta="EN_PREPARACION"
        onClick={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should not render button for transition from PENDIENTE', () => {
    const { container } = render(
      <StateTransitionButton
        estadoActual="PENDIENTE"
        estadoHasta="CONFIRMADO"
        onClick={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render CANCELADO button for PENDIENTE state (gestor can cancel)', () => {
    render(
      <StateTransitionButton
        estadoActual="PENDIENTE"
        estadoHasta="CANCELADO"
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Cancelar pedido')).toBeInTheDocument()
  })

  it('should call onClick with estadoHasta when clicked', () => {
    const handleClick = vi.fn()
    render(
      <StateTransitionButton
        estadoActual="CONFIRMADO"
        estadoHasta="EN_PREPARACION"
        onClick={handleClick}
      />,
    )
    fireEvent.click(screen.getByText('Iniciar preparación'))
    expect(handleClick).toHaveBeenCalledWith('EN_PREPARACION')
  })

  it('should disable button when disabled prop is true', () => {
    render(
      <StateTransitionButton
        estadoActual="CONFIRMADO"
        estadoHasta="EN_PREPARACION"
        onClick={vi.fn()}
        disabled={true}
      />,
    )
    expect(screen.getByText('Iniciar preparación')).toBeDisabled()
  })
})
