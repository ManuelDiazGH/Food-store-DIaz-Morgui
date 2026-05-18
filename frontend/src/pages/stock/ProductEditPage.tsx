/** ProductEditPage — Edit a product: basic info, categories, ingredients, stock. */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProtectedRoute } from '@shared/utils/ProtectedRoute'
import { ZustandToastContainer } from '@shared/ui/Toast'
import { Spinner } from '@shared/ui/Spinner'
import { ProductForm, type ProductFormData } from '@widgets/stock/ProductForm'
import { StockManager } from '@widgets/stock/StockManager'
import { useProduct, useUpdateProduct, useAssociateCategorias, useAssociateIngredientes, useUpdateStock } from '@features/stock/api/productos'
import { ROUTES } from '@shared/config/routes'

function ProductEditPageInner() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const productId = Number(id)

  const { data: product, isLoading, isError } = useProduct(productId)
  const updateProduct = useUpdateProduct()
  const associateCategorias = useAssociateCategorias()
  const associateIngredientes = useAssociateIngredientes()
  const updateStock = useUpdateStock()

  const [formLoading, setFormLoading] = useState(false)

  const [showStockManager, setShowStockManager] = useState(false)

  const handleFormSubmit = async (data: ProductFormData) => {
    setFormLoading(true)
    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion || undefined,
          precio_base: data.precio_base,
          imagen: data.imagen || undefined,
          disponible: data.disponible,
        },
      })

      await associateCategorias.mutateAsync({ id: productId, categoria_ids: data.categoria_ids })
      await associateIngredientes.mutateAsync({ id: productId, ingredientes: data.ingredientes })

      navigate(ROUTES.PRODUCTS)
    } finally {
      setFormLoading(false)
    }
  }

  const handleStockSubmit = (stockData: { cantidad: number; tipo: 'incremento' | 'absoluto' }) => {
    updateStock.mutate(
      { id: productId, data: stockData },
      { onSuccess: () => setShowStockManager(false) },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-500">Error al cargar el producto</p>
        <button onClick={() => navigate(ROUTES.PRODUCTS)} className="text-sm text-blue-600 hover:underline mt-2">
          Volver a lista
        </button>
      </div>
    )
  }

  const currentStock = product.stock_cantidad

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ZustandToastContainer />

      <div className="mb-6">
        <button
          onClick={() => navigate(ROUTES.PRODUCTS)}
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          &larr; Volver a lista
        </button>
        <h1 className="text-2xl font-bold text-stone-900 mt-2">Editar Producto</h1>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Datos básicos</h2>
        <ProductForm
          open={true}
          onClose={() => navigate(ROUTES.PRODUCTS)}
          onSubmit={handleFormSubmit}
          initialData={product}
          loading={formLoading}
        />
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">Stock</h2>
          <button
            onClick={() => setShowStockManager(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Gestionar Stock
          </button>
        </div>
        <p className="text-sm text-stone-600">
          Stock actual:{' '}
          <span className="font-semibold">
            {currentStock ?? (product.hay_stock ? 'Con stock' : 'Sin stock')}
            {currentStock !== undefined && ' unidades'}
          </span>
        </p>
      </div>

      <StockManager
        open={showStockManager}
        onClose={() => setShowStockManager(false)}
        onSubmit={handleStockSubmit}
        currentStock={currentStock ?? 0}
        productName={product.nombre}
      />
    </div>
  )
}

export default function ProductEditPage() {
  return (
    <ProtectedRoute requiredRoles={['STOCK', 'ADMIN']}>
      <ProductEditPageInner />
    </ProtectedRoute>
  )
}
