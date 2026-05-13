/** Tests para Button component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('should be disabled when loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByText('Loading')).toBeDisabled()
  })

  it('should render spinner when loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should apply fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full</Button>)
    const btn = screen.getByText('Full')
    expect(btn.className).toContain('w-full')
  })

  it('should apply variant styles', () => {
    const { rerender } = render(<Button variant="danger">Danger</Button>)
    expect(screen.getByText('Danger').className).toContain('bg-red-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary').className).toContain('bg-gray-200')
  })
})
