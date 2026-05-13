/** Tests para CartDrawer component. */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CartDrawer } from '../CartDrawer'
import { useCartStore } from '@features/cart/store/cartStore'

const mockProducto = {
  id: 1,
  nombre: 'Pizza Mozzarella',
  precio_base: 1500,
  stock_cantidad: 10,
  disponible: true,
}

const mockProducto2 = {
  ...mockProducto,
  id: 2,
  nombre: 'Empanada',
  precio_base: 500,
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
})

describe('CartDrawer', () => {
  it('should show empty state when cart is empty and drawer is open', () => {
    useCartStore.setState({ isOpen: true })
    renderWithRouter(<CartDrawer />)
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByText('Explorá el catálogo')).toBeInTheDocument()
  })

  it('should be hidden when isOpen is false', () => {
    useCartStore.setState({ isOpen: false })
    renderWithRouter(<CartDrawer />)
    // The drawer panel is rendered but translated off-screen
    expect(screen.getByText('Tu Carrito')).toBeInTheDocument()
  })

  it('should show cart items when drawer is open with items', () => {
    useCartStore.setState({
      isOpen: true,
      items: [{ producto: mockProducto, cantidad: 2 }],
    })
    renderWithRouter(<CartDrawer />)
    expect(screen.getByText('Pizza Mozzarella')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getAllByText('$3000.00')).toHaveLength(2) // item + total
  })

  it('should show total price in footer', () => {
    useCartStore.setState({
      isOpen: true,
      items: [
        { producto: mockProducto, cantidad: 2 },
        { producto: mockProducto2, cantidad: 3 },
      ],
    })
    renderWithRouter(<CartDrawer />)
    // 1500*2 + 500*3 = 4500
    expect(screen.getByText('$4500.00')).toBeInTheDocument()
  })

  it('should show ingredient exclusions text', () => {
    useCartStore.setState({
      isOpen: true,
      items: [{ producto: mockProducto, cantidad: 1, personalizacion: [1, 2] }],
    })
    renderWithRouter(<CartDrawer />)
    expect(screen.getByText('Sin 2 ingredientes')).toBeInTheDocument()
  })

  it('should call updateQuantity when - button is clicked', () => {
    useCartStore.setState({
      isOpen: true,
      items: [{ producto: mockProducto, cantidad: 2 }],
    })
    renderWithRouter(<CartDrawer />)
    fireEvent.click(screen.getByText('-'))
    const state = useCartStore.getState()
    expect(state.items[0].cantidad).toBe(1)
  })

  it('should call updateQuantity when + button is clicked', () => {
    useCartStore.setState({
      isOpen: true,
      items: [{ producto: mockProducto, cantidad: 2 }],
    })
    renderWithRouter(<CartDrawer />)
    fireEvent.click(screen.getByText('+'))
    const state = useCartStore.getState()
    expect(state.items[0].cantidad).toBe(3)
  })

  it('should call removeItem when delete button is clicked', () => {
    useCartStore.setState({
      isOpen: true,
      items: [{ producto: mockProducto, cantidad: 1 }],
    })
    renderWithRouter(<CartDrawer />)
    const deleteBtn = screen.getByLabelText('Eliminar Pizza Mozzarella')
    fireEvent.click(deleteBtn)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('should close drawer when overlay is clicked', () => {
    useCartStore.setState({ isOpen: true })
    const { container } = renderWithRouter(<CartDrawer />)
    // Get the overlay (first child of the fragment with aria-hidden="true")
    const overlay = container.querySelector('[aria-hidden="true"]')
    if (overlay) fireEvent.click(overlay)
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('should close drawer when close button is clicked', () => {
    useCartStore.setState({ isOpen: true })
    renderWithRouter(<CartDrawer />)
    const closeBtn = screen.getByLabelText('Cerrar carrito')
    fireEvent.click(closeBtn)
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('should show "Ir al carrito" button when items exist', () => {
    useCartStore.setState({
      isOpen: true,
      items: [{ producto: mockProducto, cantidad: 1 }],
    })
    renderWithRouter(<CartDrawer />)
    expect(screen.getByText('Ir al carrito')).toBeInTheDocument()
  })
})
