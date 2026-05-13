/** Tests para FormField component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormField } from '../FormField'

describe('FormField text', () => {
  it('should render label and input', () => {
    render(<FormField label="Nombre" type="text" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should show required asterisk', () => {
    render(<FormField label="Email" type="text" value="" onChange={vi.fn()} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should show error message', () => {
    render(<FormField label="Nombre" type="text" value="" onChange={vi.fn()} error="El campo es obligatorio" />)
    expect(screen.getByText('El campo es obligatorio')).toBeInTheDocument()
  })

  it('should call onChange when typing', () => {
    const handleChange = vi.fn()
    render(<FormField label="Nombre" type="text" value="" onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Juan' } })
    expect(handleChange).toHaveBeenCalledWith('Juan')
  })

  it('should display placeholder', () => {
    render(<FormField label="Nombre" type="text" value="" onChange={vi.fn()} placeholder="Ingresá tu nombre" />)
    expect(screen.getByPlaceholderText('Ingresá tu nombre')).toBeInTheDocument()
  })
})

describe('FormField checkbox', () => {
  it('should render checkbox input', () => {
    render(<FormField label="Acepto términos" type="checkbox" value={false} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should call onChange with boolean', () => {
    const handleChange = vi.fn()
    render(<FormField label="Acepto" type="checkbox" value={false} onChange={handleChange} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('should show required asterisk for checkbox', () => {
    render(<FormField label="Acepto" type="checkbox" value={false} onChange={vi.fn()} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })
})

describe('FormField select', () => {
  const options = [
    { value: 1, label: 'Opción 1' },
    { value: 2, label: 'Opción 2' },
    { value: null, label: 'Sin valor' },
  ]

  it('should render select with options', () => {
    render(<FormField label="Categoría" type="select" value={null} onChange={vi.fn()} options={options} />)
    expect(screen.getByText('Opción 1')).toBeInTheDocument()
    expect(screen.getByText('Opción 2')).toBeInTheDocument()
  })

  it('should display placeholder text', () => {
    render(<FormField label="Categoría" type="select" value={null} onChange={vi.fn()} options={options} placeholder="Elegí una..." />)
    expect(screen.getByText('Elegí una...')).toBeInTheDocument()
  })

  it('should call onChange with number when option selected', () => {
    const handleChange = vi.fn()
    render(<FormField label="Categoría" type="select" value={null} onChange={handleChange} options={options} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
    expect(handleChange).toHaveBeenCalledWith(1)
  })

  it('should call onChange with null when empty option selected', () => {
    const handleChange = vi.fn()
    render(<FormField label="Categoría" type="select" value={1} onChange={handleChange} options={options} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
    expect(handleChange).toHaveBeenCalledWith(null)
  })
})
