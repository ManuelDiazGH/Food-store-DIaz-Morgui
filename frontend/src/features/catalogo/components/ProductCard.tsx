import type { ProductoCatalogoRead } from '@entities/types'

interface ProductCardProps {
  product: ProductoCatalogoRead
  onClick?: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {product.imagen ? (
        <img src={product.imagen} alt={product.nombre} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-stone-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 text-lg">{product.nombre}</h3>
        {product.categorias.length > 0 && (
          <p className="text-xs text-stone-400 mt-1">{product.categorias.join(', ')}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-brand-600">${Number(product.precio_base).toFixed(2)}</span>
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