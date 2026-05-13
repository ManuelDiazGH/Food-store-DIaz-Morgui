import { useProductoDetalle } from '@entities/api/productosApi'
import { useNavigate } from 'react-router-dom'

interface ProductDetailProps {
  productId: number
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProductoDetalle(productId)

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Cargando producto...</div>
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Producto no encontrado</p>
        <button onClick={() => navigate(-1)} className="text-orange-600 hover:underline">
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-orange-600 hover:underline mb-4 inline-block">
        ← Volver al catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          {product.imagen ? (
            <img src={product.imagen} alt={product.nombre} className="w-full rounded-lg shadow-md" />
          ) : (
            <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-6xl">🍽️</div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.nombre}</h1>
          {product.descripcion && <p className="text-gray-600 mt-2">{product.descripcion}</p>}

          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold text-orange-600">${product.precio_base.toFixed(2)}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.hay_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {product.hay_stock ? 'En stock' : 'Agotado'}
            </span>
            {!product.disponible && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                No disponible
              </span>
            )}
          </div>

          {/* Categories */}
          {product.categorias.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">Categorías</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.categorias.map((cat) => (
                  <span key={cat.id} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm">
                    {cat.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredientes.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">Ingredientes</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.ingredientes.map((ingr) => (
                  <span
                    key={ingr.id}
                    className={`px-2 py-1 rounded text-sm ${
                      ingr.es_alergeno
                        ? 'bg-red-100 text-red-700 font-medium'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ingr.nombre}
                    {ingr.es_alergeno && ' ⚠️'}
                    {ingr.es_removible && ' 🔽'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergen warning */}
          {product.ingredientes.some((i) => i.es_alergeno) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Este producto contiene alérgenos: {product.ingredientes.filter((i) => i.es_alergeno).map((i) => i.nombre).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}