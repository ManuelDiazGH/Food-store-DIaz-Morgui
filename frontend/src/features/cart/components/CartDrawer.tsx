/** CartDrawer — slide-out cart drawer. Minimalist. */
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
    return `Sin ${item.personalizacion.length} ingrediente${item.personalizacion.length > 1 ? 's' : ''}`
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={toggleCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">Tu Carrito</h2>
          <button
            onClick={toggleCart}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-65px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <p className="text-stone-500 mb-3">Tu carrito está vacío</p>
              <button
                onClick={toggleCart}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Explorá el catálogo
              </button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.producto.id}
                    className="flex gap-3 p-3 bg-stone-50 rounded-xl"
                  >
                    <div className="w-14 h-14 rounded-xl bg-stone-200 flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden">
                      {item.producto.imagen ? (
                        <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.producto.nombre}</p>

                      {formatItemExclusions(item) && (
                        <p className="text-xs text-red-500 mt-0.5">{formatItemExclusions(item)}</p>
                      )}

                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                            className="w-6 h-6 rounded-lg border border-stone-200 flex items-center justify-center text-xs text-stone-500 hover:bg-stone-100 transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium text-stone-900 w-5 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                            className="w-6 h-6 rounded-lg border border-stone-200 flex items-center justify-center text-xs text-stone-500 hover:bg-stone-100 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-stone-900">
                            ${(item.producto.precio_base * item.cantidad).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.producto.id)}
                            className="text-stone-300 hover:text-red-500 transition-colors"
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
              <div className="border-t border-stone-100 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Total</span>
                  <span className="text-xl font-bold text-stone-900">${totalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleGoToCart}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
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
