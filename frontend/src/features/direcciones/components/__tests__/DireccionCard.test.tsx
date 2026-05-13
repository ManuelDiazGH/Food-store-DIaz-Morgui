/** Tests para DireccionCard component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DireccionCard } from '../DireccionCard'
import type { DireccionEntrega } from '@entities/types'

const mockDireccion: DireccionEntrega = {
  id: 1,
  alias: 'Casa',
  linea1: 'Av. Siempre Viva 123',
  linea2: 'Piso 3',
  ciudad: 'Buenos Aires',
  cp: '1425',
  es_principal: false,
  usuario_id: 1,
}

describe('DireccionCard', () => {
  it('should render address details', () => {
    render(<DireccionCard direccion={mockDireccion} onEdit={vi.fn()} onDelete={vi.fn()} onSetPrincipal={vi.fn()} />)
    expect(screen.getByText('Casa')).toBeInTheDocument()
    expect(screen.getByText('Av. Siempre Viva 123, Piso 3')).toBeInTheDocument()
    expect(screen.getByText('Buenos Aires, CP 1425')).toBeInTheDocument()
  })

  it('should show "Principal" badge when address is default', () => {
    render(<DireccionCard direccion={{ ...mockDireccion, es_principal: true }} onEdit={vi.fn()} onDelete={vi.fn()} onSetPrincipal={vi.fn()} />)
    expect(screen.getByText('Principal')).toBeInTheDocument()
  })

  it('should not show "Principal" badge when not default', () => {
    render(<DireccionCard direccion={mockDireccion} onEdit={vi.fn()} onDelete={vi.fn()} onSetPrincipal={vi.fn()} />)
    expect(screen.queryByText('Principal')).not.toBeInTheDocument()
  })

  it('should show "Establecer como principal" button when not default', () => {
    render(<DireccionCard direccion={mockDireccion} onEdit={vi.fn()} onDelete={vi.fn()} onSetPrincipal={vi.fn()} />)
    expect(screen.getByText('Establecer como principal')).toBeInTheDocument()
  })

  it('should hide "Establecer como principal" button when already default', () => {
    render(<DireccionCard direccion={{ ...mockDireccion, es_principal: true }} onEdit={vi.fn()} onDelete={vi.fn()} onSetPrincipal={vi.fn()} />)
    expect(screen.queryByText('Establecer como principal')).not.toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const handleEdit = vi.fn()
    render(<DireccionCard direccion={mockDireccion} onEdit={handleEdit} onDelete={vi.fn()} onSetPrincipal={vi.fn()} />)
    fireEvent.click(screen.getByText('Editar'))
    expect(handleEdit).toHaveBeenCalledWith(1)
  })

  it('should call onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn()
    render(<DireccionCard direccion={mockDireccion} onEdit={vi.fn()} onDelete={handleDelete} onSetPrincipal={vi.fn()} />)
    fireEvent.click(screen.getByText('Eliminar'))
    expect(handleDelete).toHaveBeenCalledWith(1)
  })

  it('should call onSetPrincipal when set-principal button is clicked', () => {
    const handleSetPrincipal = vi.fn()
    render(<DireccionCard direccion={mockDireccion} onEdit={vi.fn()} onDelete={vi.fn()} onSetPrincipal={handleSetPrincipal} />)
    fireEvent.click(screen.getByText('Establecer como principal'))
    expect(handleSetPrincipal).toHaveBeenCalledWith(1)
  })

  it('should handle missing alias gracefully', () => {
    render(<DireccionCard direccion={{ ...mockDireccion, alias: undefined }} onEdit={vi.fn()} onDelete={vi.fn()} onSetPrincipal={vi.fn()} />)
    // Should still render address without alias
    expect(screen.getByText('Av. Siempre Viva 123, Piso 3')).toBeInTheDocument()
  })

  it('should handle missing linea2 gracefully', () => {
    render(<DireccionCard direccion={{ ...mockDireccion, linea2: undefined }} onEdit={vi.fn()} onDelete={vi.fn()} onSetPrincipal={vi.fn()} />)
    expect(screen.getByText('Av. Siempre Viva 123')).toBeInTheDocument()
  })
})
