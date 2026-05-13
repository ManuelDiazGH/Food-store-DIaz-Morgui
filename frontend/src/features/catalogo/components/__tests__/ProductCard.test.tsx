/** Tests para ProductCard component. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '../ProductCard'
import type { ProductoCatalogoRead } from '@entities/types'

const mockProduct: ProductoCatalogoRead = {
  id: 1,
  nombre: 'Pizza Mozzarella',
  descripcion: 'Pizza con queso',
  precio_base: 1500,
  stock_cantidad: 10,
  hay_stock: true,
  disponible: true,
  imagen: undefined,
  categorias: ['Pizzas'],
  ingredientes: [],
  created_at: '2024-01-01T00:00:00Z',
}

describe('ProductCard', () => {
  it('should render product name and price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Pizza Mozzarella')).toBeInTheDocument()
    expect(screen.getByText('$1500.00')).toBeInTheDocument()
  })

  it('should show "Disponible" when product is available', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Disponible')).toBeInTheDocument()
  })

  it('should show "Agotado" when product is not available', () => {
    render(<ProductCard product={{ ...mockProduct, disponible: false }} />)
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })

  it('should show category labels', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Pizzas')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<ProductCard product={mockProduct} onClick={handleClick} />)
    fireEvent.click(screen.getByText('Pizza Mozzarella'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render image when provided', () => {
    render(<ProductCard product={{ ...mockProduct, imagen: 'https://example.com/pizza.jpg' }} />)
    const img = screen.getByAltText('Pizza Mozzarella') as HTMLImageElement
    expect(img.src).toBe('https://example.com/pizza.jpg')
  })
})
