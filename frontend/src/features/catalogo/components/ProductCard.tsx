import type { ProductoCatalogoRead } from '@entities/types'

interface ProductCardProps {
  product: ProductoCatalogoRead
  onClick?: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {product.imagen ? (
        <img src={product.imagen} alt={product.nombre} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-4xl">🍽️</div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg">{product.nombre}</h3>
        {product.categorias.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">{product.categorias.join(', ')}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-orange-600">${Number(product.precio_base).toFixed(2)}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              product.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {product.disponible ? 'Disponible' : 'Agotado'}
          </span>
        </div>
      </div>
    </div>
  )
}