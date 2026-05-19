import { useState } from 'react'
import { useProductoDetalle } from '@entities/api/productosApi'
import { useCartStore } from '@features/cart/store/cartStore'
import { useNavigate } from 'react-router-dom'

interface ProductDetailProps {
  productId: number
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const { data: product, isLoading, error } = useProductoDetalle(productId)

  const [cantidad, setCantidad] = useState(1)
  const [exclusiones, setExclusiones] = useState<number[]>([])
  const [addedFeedback, setAddedFeedback] = useState(false)

  if (isLoading) {
    return <div className="text-center py-12 text-stone-400">Cargando producto...</div>
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Producto no encontrado</p>
        <button onClick={() => navigate(-1)} className="text-brand-600 hover:underline">
          Volver
        </button>
      </div>
    )
  }

  const canAddToCart = product.hay_stock && product.disponible

  function toggleExclusion(ingrId: number) {
    setExclusiones((prev) =>
      prev.includes(ingrId) ? prev.filter((id) => id !== ingrId) : [...prev, ingrId],
    )
  }

  function handleAddToCart() {
    if (!product || !canAddToCart) return
    addItem(
      {
        id: product.id,
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio_base: product.precio_base,
        stock_cantidad: product.hay_stock ? 999 : 0,
        disponible: product.disponible,
        imagen: product.imagen,
        created_at: '',
        categorias: product.categorias.map((c) => ({
          producto_id: product.id,
          categoria_id: c.id,
          es_principal: c.es_principal,
        })),
        ingredientes: product.ingredientes.map((i) => ({
          producto_id: product.id,
          ingrediente_id: i.id,
          es_removible: i.es_removible,
          nombre: i.nombre,
        })),
      },
      cantidad,
      exclusiones.length > 0 ? exclusiones : undefined,
    )
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-brand-600 hover:underline mb-4 inline-block">
        ← Volver al catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          {product.imagen ? (
            <img src={product.imagen} alt={product.nombre} className="w-full rounded-lg shadow-md" />
          ) : (
            <div className="w-full aspect-square bg-stone-100 rounded-xl flex items-center justify-center">
              <svg className="w-20 h-20 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{product.nombre}</h1>
          {product.descripcion && <p className="text-stone-600 mt-2">{product.descripcion}</p>}

          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold text-brand-600">${Number(product.precio_base).toFixed(2)}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.hay_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {product.hay_stock ? 'En stock' : 'Agotado'}
            </span>
            {!product.disponible && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-stone-100 text-stone-500">
                No disponible
              </span>
            )}
          </div>

          {/* Categories */}
          {product.categorias.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-stone-700">Categorías</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.categorias.map((cat) => (
                  <span key={cat.id} className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-sm">
                    {cat.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-stone-700 mb-2">Cantidad</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
                className="w-10 h-10 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-xl font-semibold text-stone-900 w-8 text-center">{cantidad}</span>
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-10 h-10 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Ingredient exclusions */}
          {product.ingredientes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-stone-700 mb-2">Ingredientes</h3>
              <div className="space-y-2">
                {product.ingredientes.map((ingr) => (
                  <label
                    key={ingr.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      !ingr.es_removible
                        ? 'border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed'
                        : exclusiones.includes(ingr.id)
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {ingr.es_removible ? (
                      <input
                        type="checkbox"
                        checked={exclusiones.includes(ingr.id)}
                        onChange={() => toggleExclusion(ingr.id)}
                        className="rounded border-stone-300 text-red-500 focus:ring-red-400"
                      />
                    ) : (
                      <span className="w-4 h-4 block" />
                    )}
                    <span className="flex-1">{ingr.nombre}</span>
                    {ingr.es_alergeno && <span className="text-xs text-red-500 font-medium">Alérgeno</span>}
                    {ingr.es_removible && (
                      <span className="text-xs text-stone-400">
                        {exclusiones.includes(ingr.id) ? `Sin ${ingr.nombre}` : '—'}
                      </span>
                    )}
                    {!ingr.es_removible && <span className="text-xs text-stone-400">Fijo</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart button */}
          <div className="mt-6">
            {addedFeedback && (
              <div className="mb-3 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg text-center animate-pulse">
                Agregado al carrito
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="w-full py-3 px-6 text-base font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-gray-300 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors"
            >
              {!product.hay_stock
                ? 'Sin stock'
                : !product.disponible
                  ? 'No disponible'
                  : `Agregar al carrito — $${(product.precio_base * cantidad).toFixed(2)}`}
            </button>
          </div>

          {/* Allergen warning */}
          {product.ingredientes.some((i) => i.es_alergeno) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Este producto contiene alérgenos: {product.ingredientes.filter((i) => i.es_alergeno).map((i) => i.nombre).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
