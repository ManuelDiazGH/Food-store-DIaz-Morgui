/** Tests para Spinner component. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from '../Spinner'

describe('Spinner', () => {
  it('should render with status role and aria-label', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Cargando')).toBeInTheDocument()
  })

  it('should apply default size (md) classes', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner.className).toContain('h-6 w-6')
  })

  it('should apply size classes', () => {
    const { rerender } = render(<Spinner size="sm" />)
    expect(screen.getByRole('status').className).toContain('h-4 w-4')

    rerender(<Spinner size="lg" />)
    expect(screen.getByRole('status').className).toContain('h-10 w-10')
  })

  it('should apply color classes', () => {
    const { rerender } = render(<Spinner color="white" />)
    expect(screen.getByRole('status').className).toContain('border-white')

    rerender(<Spinner color="gray" />)
    expect(screen.getByRole('status').className).toContain('border-gray-400')
  })

  it('should include animation class', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').className).toContain('animate-spin')
  })
})
