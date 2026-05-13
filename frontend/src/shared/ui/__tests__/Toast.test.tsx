/** Tests para Toast system — Zustand store y componentes. */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useToastStore, ZustandToastContainer } from '../Toast'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useToastStore (Zustand)', () => {
  it('should start with empty toasts', () => {
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('should add a toast with default type success', () => {
    useToastStore.getState().addToast('Operación exitosa')
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Operación exitosa')
    expect(toasts[0].type).toBe('success')
  })

  it('should add a toast with custom type', () => {
    useToastStore.getState().addToast('Error fatal', 'error')
    expect(useToastStore.getState().toasts[0].type).toBe('error')
  })

  it('should auto-remove toast after 3 seconds', () => {
    useToastStore.getState().addToast('Temporal')
    expect(useToastStore.getState().toasts).toHaveLength(1)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('should remove toast manually', () => {
    useToastStore.getState().addToast('Eliminame')
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().removeToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('should handle multiple toasts', () => {
    useToastStore.getState().addToast('Uno')
    useToastStore.getState().addToast('Dos', 'warning')
    useToastStore.getState().addToast('Tres', 'error')
    expect(useToastStore.getState().toasts).toHaveLength(3)
  })
})

describe('ZustandToastContainer', () => {
  it('should render nothing when no toasts', () => {
    const { container } = render(<ZustandToastContainer />)
    expect(container.firstChild?.firstChild).toBeNull()
  })

  it('should render toasts', () => {
    useToastStore.getState().addToast('Mensaje de prueba')
    render(<ZustandToastContainer />)
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument()
  })

  it('should render multiple toasts', () => {
    useToastStore.getState().addToast('Primero')
    useToastStore.getState().addToast('Segundo')
    render(<ZustandToastContainer />)
    expect(screen.getByText('Primero')).toBeInTheDocument()
    expect(screen.getByText('Segundo')).toBeInTheDocument()
  })

  it('should remove toast on click', () => {
    useToastStore.getState().addToast('Click para cerrar')
    render(<ZustandToastContainer />)
    fireEvent.click(screen.getByText('Click para cerrar'))
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
