/** Tests para OrderTable component. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OrderTable } from '../OrderTable'
import type { Pedido } from '@entities/types'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  )
}

const mockPedidoPendiente: Pedido = {
  id: 1,
  usuario_id: 1,
  estado_codigo: 'PENDIENTE',
  total: '150.00',
  costo_envio: '50.00',
  forma_pago_codigo: 'EFECTIVO',
  created_at: '2024-06-01T12:00:00Z',
  usuario: { id: 1, nombre: 'Juan Pérez', email: 'juan@test.com' },
  detalles: [],
  historial: [],
}

const mockPedidoConfirmado: Pedido = {
  ...mockPedidoPendiente,
  id: 2,
  estado_codigo: 'CONFIRMADO',
}

const mockPedidoEntregado: Pedido = {
  ...mockPedidoPendiente,
  id: 3,
  estado_codigo: 'ENTREGADO',
}

describe('OrderTable', () => {
  it('should render order rows', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoPendiente, mockPedidoConfirmado]} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })

  it('should show client name', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoPendiente]} />)
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('should show status badges', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoPendiente, mockPedidoConfirmado, mockPedidoEntregado]} />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Confirmado')).toBeInTheDocument()
    expect(screen.getByText('Entregado')).toBeInTheDocument()
  })

  it('should show order total', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoPendiente]} />)
    expect(screen.getByText('$150.00')).toBeInTheDocument()
  })

  it('should render action buttons for non-terminal states', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoConfirmado]} />)
    // CONFIRMADO: should show state transition buttons
    expect(screen.getByText('Cancelar pedido')).toBeInTheDocument()
  })

  it('should not render action buttons for terminal states', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoEntregado]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('should render cancel button for PENDIENTE state', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoPendiente]} />)
    expect(screen.getByText('Cancelar pedido')).toBeInTheDocument()
  })

  it('should link to order panel detail', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoPendiente]} />)
    const link = screen.getByText('#1').closest('a')
    expect(link).toHaveAttribute('href', '/orders-panel/1')
  })

  it('should render table headers', () => {
    renderWithProviders(<OrderTable pedidos={[mockPedidoPendiente]} />)
    expect(screen.getByText('Pedido')).toBeInTheDocument()
    expect(screen.getByText('Cliente')).toBeInTheDocument()
    expect(screen.getByText('Fecha')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Acciones')).toBeInTheDocument()
  })

  it('should show fallback for missing user name', () => {
    renderWithProviders(<OrderTable pedidos={[{ ...mockPedidoPendiente, usuario: undefined }]} />)
    expect(screen.getByText('Usuario #1')).toBeInTheDocument()
  })
})
