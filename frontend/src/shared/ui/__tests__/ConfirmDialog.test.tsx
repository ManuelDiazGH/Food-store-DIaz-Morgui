/** Tests para ConfirmDialog component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  it('should not render when open is false', () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Test" message="Message" onConfirm={vi.fn()} onClose={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render title and message when open', () => {
    render(
      <ConfirmDialog open={true} title="Eliminar" message="¿Estás seguro?" onConfirm={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
  })

  it('should render default button labels', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('should render custom button labels', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={vi.fn()} onClose={vi.fn()} confirmLabel="Sí, eliminar" cancelLabel="No, volver" />,
    )
    expect(screen.getByText('Sí, eliminar')).toBeInTheDocument()
    expect(screen.getByText('No, volver')).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', () => {
    const handleConfirm = vi.fn()
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={handleConfirm} onClose={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('Confirmar'))
    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when cancel button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={vi.fn()} onClose={handleClose} />,
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    const handleClose = vi.fn()
    const { container } = render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={vi.fn()} onClose={handleClose} />,
    )
    // Click the overlay (first child of the fixed container)
    const overlay = container.querySelector('.bg-black\\/50')
    if (overlay) fireEvent.click(overlay)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should disable confirm button when confirmDisabled is true', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={vi.fn()} onClose={vi.fn()} confirmDisabled={true} />,
    )
    expect(screen.getByText('Confirmar')).toBeDisabled()
  })

  it('should apply danger variant styles by default', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText('Confirmar').className).toContain('bg-red-600')
  })

  it('should apply warning variant styles when specified', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={vi.fn()} onClose={vi.fn()} variant="warning" />,
    )
    expect(screen.getByText('Confirmar').className).toContain('bg-yellow-500')
  })

  it('should render ReactNode message', () => {
    render(
      <ConfirmDialog open={true} title="Test" message={<span>Mensaje <strong>importante</strong></span>} onConfirm={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText('importante')).toBeInTheDocument()
  })
})
