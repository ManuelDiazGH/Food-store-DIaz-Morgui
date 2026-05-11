/** Cart store — Zustand state management for shopping cart.

Manages: cart items, quantities, totals, localStorage persistence.
State separation: this is CLIENT state (cart session), NOT server state.
Server state (order submission) should use TanStack Query.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '@entities/types'

export interface CartItem {
  producto: Producto
  cantidad: number
  personalizacion?: number[]
}

interface CartState {
  // ── State ────────────────────────────────────────────────────
  items: CartItem[]
  isOpen: boolean

  // ── Computed ──────────────────────────────────────────────────
  totalItems: () => number
  totalPrice: () => number

  // ── Actions ──────────────────────────────────────────────────
  addItem: (producto: Producto, cantidad?: number, personalizacion?: number[]) => void
  removeItem: (productoId: number) => void
  updateQuantity: (productoId: number, cantidad: number) => void
  clearCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────
      items: [],
      isOpen: false,

      // ── Computed ────────────────────────────────────────────
      totalItems: () => get().items.reduce((sum, item) => sum + item.cantidad, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.producto.precio_base * item.cantidad,
          0,
        ),

      // ── Actions ─────────────────────────────────────────────
      addItem: (producto: Producto, cantidad = 1, personalizacion?: number[]) =>
        set((state) => {
          const existing = state.items.find((i) => i.producto.id === producto.id)

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i,
              ),
            }
          }

          return {
            items: [...state.items, { producto, cantidad, personalizacion }],
          }
        }),

      removeItem: (productoId: number) =>
        set((state) => ({
          items: state.items.filter((i) => i.producto.id !== productoId),
        })),

      updateQuantity: (productoId: number, cantidad: number) =>
        set((state) => {
          if (cantidad <= 0) {
            return { items: state.items.filter((i) => i.producto.id !== productoId) }
          }
          return {
            items: state.items.map((i) =>
              i.producto.id === productoId ? { ...i, cantidad } : i,
            ),
          }
        }),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({ items: state.items }),
    },
  ),
)