/** CartDrawer — slide-out cart drawer from the right side.

Renders globally via Layout.tsx. Toggled by useCartStore.isOpen / toggleCart.
 */
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@features/cart/store/cartStore'
import { ROUTES } from '@shared/config/routes'

export function CartDrawer() {
  const navigate = useNavigate()
  const { items, isOpen, toggleCart, removeItem, updateQuantity, totalPrice } = useCartStore()

  function handleGoToCart() {
    toggleCart()
    navigate(ROUTES.CART)
  }

  function formatItemExclusions(item: (typeof items)[0]): string | null {
    if (!item.personalizacion || item.personalizacion.length === 0) return null
    // We don't have the ingredient names in the cart item, so we show count
    return `Sin ${item.personalizacion.length} ingrediente${item.personalizacion.length > 1 ? 's' : ''}`
  }

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={toggleCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tu Carrito</h2>
          <button
            onClick={toggleCart}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-60px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
              <span className="text-5xl mb-4">🛒</span>
              <p className="text-gray-500 mb-2">Tu carrito está vacío</p>
              <button
                onClick={toggleCart}
                className="text-sm text-orange-600 hover:underline"
              >
                Explorá el catálogo
              </button>
            </div>
          ) : (
            <>
              {/* Items list */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.producto.id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden">
                      {item.producto.imagen ? (
                        <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />
                      ) : (
                        '🍽️'
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.producto.nombre}</p>

                      {/* Exclusiones */}
                      {formatItemExclusions(item) && (
                        <p className="text-xs text-red-500 mt-0.5">{formatItemExclusions(item)}</p>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-5 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Price + remove */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            ${(item.producto.precio_base * item.cantidad).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.producto.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label={`Eliminar ${item.producto.nombre}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-xl font-bold text-gray-900">${totalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleGoToCart}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Ir al carrito
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
