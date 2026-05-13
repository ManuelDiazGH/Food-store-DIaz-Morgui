/** Tests para DireccionForm component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DireccionForm } from '../DireccionForm'

describe('DireccionForm', () => {
  it('should render all required fields', () => {
    render(<DireccionForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/Calle y número/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ciudad/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Código Postal/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Alias/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Piso \/ Depto/)).toBeInTheDocument()
  })

  it('should show validation errors on empty submit', async () => {
    render(<DireccionForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Agregar dirección'))
    await waitFor(() => {
      expect(screen.getByText('La calle y número son obligatorios')).toBeInTheDocument()
      expect(screen.getByText('La ciudad es obligatoria')).toBeInTheDocument()
      expect(screen.getByText('El código postal es obligatorio')).toBeInTheDocument()
    })
  })

  it('should call onSubmit with form data when valid', async () => {
    const handleSubmit = vi.fn()
    render(<DireccionForm onSubmit={handleSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/Calle y número/), 'Av. Siempre Viva 123')
    await userEvent.type(screen.getByLabelText(/Ciudad/), 'Buenos Aires')
    await userEvent.type(screen.getByLabelText(/Código Postal/), '1425')

    fireEvent.click(screen.getByText('Agregar dirección'))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        alias: '',
        linea1: 'Av. Siempre Viva 123',
        linea2: '',
        ciudad: 'Buenos Aires',
        cp: '1425',
        es_principal: false,
      })
    })
  })

  it('should allow optional fields to be filled', async () => {
    const handleSubmit = vi.fn()
    render(<DireccionForm onSubmit={handleSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/Alias/), 'Casa')
    await userEvent.type(screen.getByLabelText(/Calle y número/), 'Av. Siempre Viva 123')
    await userEvent.type(screen.getByLabelText(/Piso \/ Depto/), 'Piso 3')
    await userEvent.type(screen.getByLabelText(/Ciudad/), 'Buenos Aires')
    await userEvent.type(screen.getByLabelText(/Código Postal/), '1425')

    fireEvent.click(screen.getByText('Agregar dirección'))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        alias: 'Casa',
        linea1: 'Av. Siempre Viva 123',
        linea2: 'Piso 3',
        ciudad: 'Buenos Aires',
        cp: '1425',
        es_principal: false,
      })
    })
  })

  it('should call onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn()
    render(<DireccionForm onSubmit={vi.fn()} onCancel={handleCancel} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('should show "Guardar cambios" when editing existing address', () => {
    const mockDireccion = {
      id: 1,
      alias: 'Casa',
      linea1: 'Av. Siempre Viva 123',
      linea2: 'Piso 3',
      ciudad: 'Buenos Aires',
      cp: '1425',
      es_principal: true,
      usuario_id: 1,
    }
    render(<DireccionForm initialData={mockDireccion} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Guardar cambios')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Casa')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Av. Siempre Viva 123')).toBeInTheDocument()
  })

  it('should set es_principal checkbox based on initial data', () => {
    const mockDireccion = {
      id: 1,
      alias: 'Casa',
      linea1: 'Av. Siempre Viva 123',
      linea2: '',
      ciudad: 'Buenos Aires',
      cp: '1425',
      es_principal: true,
      usuario_id: 1,
    }
    render(<DireccionForm initialData={mockDireccion} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const checkbox = screen.getByLabelText(/Establecer como dirección principal/) as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('should disable submit button when loading', () => {
    render(<DireccionForm onSubmit={vi.fn()} onCancel={vi.fn()} isLoading={true} />)
    expect(screen.getByText('Guardando...')).toBeDisabled()
  })
})
