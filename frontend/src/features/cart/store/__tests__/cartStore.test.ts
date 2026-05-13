/** Tests para cartStore (Zustand + persist). */
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cartStore'
import type { Producto } from '@entities/types'

const mockProducto: Producto = {
  id: 1,
  nombre: 'Pizza Mozzarella',
  descripcion: 'Pizza clásica',
  precio_base: 1500,
  stock_cantidad: 10,
  disponible: true,
  imagen: undefined,
  created_at: '2024-01-01T00:00:00Z',
  categorias: [{ producto_id: 1, categoria_id: 1, es_principal: true }],
  ingredientes: [{ producto_id: 1, ingrediente_id: 1, es_removible: true }],
}

const mockProducto2: Producto = {
  ...mockProducto,
  id: 2,
  nombre: 'Empanada',
  precio_base: 500,
}

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
  localStorage.clear()
})

describe('cartStore', () => {
  it('should start with empty cart', () => {
    const state = useCartStore.getState()
    expect(state.items).toEqual([])
    expect(state.totalItems()).toBe(0)
    expect(state.totalPrice()).toBe(0)
  })

  it('should add item to cart', () => {
    useCartStore.getState().addItem(mockProducto)
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].producto.id).toBe(1)
    expect(state.items[0].cantidad).toBe(1)
    expect(state.totalItems()).toBe(1)
  })

  it('should add item with custom quantity', () => {
    useCartStore.getState().addItem(mockProducto, 3)
    expect(useCartStore.getState().items[0].cantidad).toBe(3)
    expect(useCartStore.getState().totalItems()).toBe(3)
  })

  it('should increment quantity when adding existing item', () => {
    useCartStore.getState().addItem(mockProducto, 2)
    useCartStore.getState().addItem(mockProducto, 3)
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].cantidad).toBe(5)
  })

  it('should calculate total price correctly', () => {
    useCartStore.getState().addItem(mockProducto, 2)  // 1500 * 2 = 3000
    useCartStore.getState().addItem(mockProducto2, 3)  // 500 * 3 = 1500
    expect(useCartStore.getState().totalPrice()).toBe(4500)
  })

  it('should remove item from cart', () => {
    useCartStore.getState().addItem(mockProducto)
    useCartStore.getState().addItem(mockProducto2)
    useCartStore.getState().removeItem(1)
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].producto.id).toBe(2)
  })

  it('should update quantity', () => {
    useCartStore.getState().addItem(mockProducto, 2)
    useCartStore.getState().updateQuantity(1, 5)
    expect(useCartStore.getState().items[0].cantidad).toBe(5)
  })

  it('should remove item when quantity set to 0', () => {
    useCartStore.getState().addItem(mockProducto)
    useCartStore.getState().updateQuantity(1, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('should remove item when quantity set to negative', () => {
    useCartStore.getState().addItem(mockProducto)
    useCartStore.getState().updateQuantity(1, -1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('should clear entire cart', () => {
    useCartStore.getState().addItem(mockProducto)
    useCartStore.getState().addItem(mockProducto2)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
    expect(useCartStore.getState().totalItems()).toBe(0)
  })

  it('should toggle cart drawer', () => {
    expect(useCartStore.getState().isOpen).toBe(false)
    useCartStore.getState().toggleCart()
    expect(useCartStore.getState().isOpen).toBe(true)
    useCartStore.getState().toggleCart()
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('should add item with ingredient exclusions', () => {
    useCartStore.getState().addItem(mockProducto, 1, [1])
    expect(useCartStore.getState().items[0].personalizacion).toEqual([1])
  })
})
