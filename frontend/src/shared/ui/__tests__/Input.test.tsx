/** Tests para Input component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../Input'

describe('Input', () => {
  it('should render input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should render required asterisk', () => {
    render(<Input label="Nombre" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should show error message', () => {
    render(<Input label="Email" error="El email es obligatorio" />)
    expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should set aria-invalid when error exists', () => {
    render(<Input error="Error" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('should call onChange when typing', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hola' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is set', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should render icon when provided', () => {
    render(<Input icon={<span data-testid="icon">🔍</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should link label to input via htmlFor/id', () => {
    render(<Input id="my-input" label="My Label" />)
    expect(screen.getByLabelText('My Label')).toBeInTheDocument()
  })

  it('should auto-generate id from label', () => {
    render(<Input label="Email Address" />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })
})
