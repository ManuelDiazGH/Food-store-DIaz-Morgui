/** Tests para TransitionModal component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransitionModal } from '../TransitionModal'

describe('TransitionModal', () => {
  it('should not render when open is false', () => {
    const { container } = render(
      <TransitionModal open={false} estadoHasta="EN_PREPARACION" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render when open is true', () => {
    render(
      <TransitionModal open={true} estadoHasta="EN_PREPARACION" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.getByText('Iniciar preparación')).toBeInTheDocument()
    expect(screen.getByText(/¿Estás seguro/)).toBeInTheDocument()
  })

  it('should show different title for CANCELADO', () => {
    render(
      <TransitionModal open={true} estadoHasta="CANCELADO" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.getByText('Cancelar pedido')).toBeInTheDocument()
  })

  it('should require reason for CANCELADO', async () => {
    render(
      <TransitionModal open={true} estadoHasta="CANCELADO" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('Confirmar'))
    await waitFor(() => {
      expect(screen.getByText('El motivo es obligatorio para cancelar')).toBeInTheDocument()
    })
  })

  it('should show "Indicá el motivo..." placeholder for CANCELADO', () => {
    render(
      <TransitionModal open={true} estadoHasta="CANCELADO" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    const textarea = screen.getByPlaceholderText('Indicá el motivo...')
    expect(textarea).toBeInTheDocument()
  })

  it('should show "Opcional..." placeholder for non-cancel states', () => {
    render(
      <TransitionModal open={true} estadoHasta="EN_PREPARACION" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.getByPlaceholderText('Opcional...')).toBeInTheDocument()
  })

  it('should call onConfirm with observacion when valid', async () => {
    const handleConfirm = vi.fn()
    render(
      <TransitionModal open={true} estadoHasta="EN_PREPARACION" onConfirm={handleConfirm} onCancel={vi.fn()} />,
    )
    const textarea = screen.getByPlaceholderText('Opcional...')
    await userEvent.type(textarea, 'Listo para cocinar')
    fireEvent.click(screen.getByText('Confirmar'))
    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledWith('Listo para cocinar')
    })
  })

  it('should call onConfirm with undefined when no observacion (optional)', async () => {
    const handleConfirm = vi.fn()
    render(
      <TransitionModal open={true} estadoHasta="EN_PREPARACION" onConfirm={handleConfirm} onCancel={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('Confirmar'))
    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledWith(undefined)
    })
  })

  it('should call onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn()
    render(
      <TransitionModal open={true} estadoHasta="EN_PREPARACION" onConfirm={vi.fn()} onCancel={handleCancel} />,
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('should disable buttons when loading', () => {
    render(
      <TransitionModal open={true} estadoHasta="EN_PREPARACION" onConfirm={vi.fn()} onCancel={vi.fn()} isLoading={true} />,
    )
    expect(screen.getByText('Procesando...')).toBeDisabled()
    expect(screen.getByText('Cancelar')).toBeDisabled()
  })

  it('should accept observacion with reason for CANCELADO', async () => {
    const handleConfirm = vi.fn()
    render(
      <TransitionModal open={true} estadoHasta="CANCELADO" onConfirm={handleConfirm} onCancel={vi.fn()} />,
    )
    const textarea = screen.getByPlaceholderText('Indicá el motivo...')
    await userEvent.type(textarea, 'Cliente solicitó cancelación')
    fireEvent.click(screen.getByText('Confirmar'))
    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledWith('Cliente solicitó cancelación')
    })
  })

  it('should handle unknown estadoHasta gracefully', () => {
    render(
      <TransitionModal open={true} estadoHasta="UNKNOWN_STATE" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.getByText('Transicionar a UNKNOWN_STATE')).toBeInTheDocument()
  })
})
