/** ProductListPage — Stock management: paginated product list with actions. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProtectedRoute } from '@shared/utils/ProtectedRoute'
import { ZustandToastContainer } from '@shared/ui/Toast'
import { ProductTable } from '@widgets/stock/ProductTable'
import { StockManager } from '@widgets/stock/StockManager'
import { ProductDeleteConfirm } from '@widgets/stock/ProductDeleteConfirm'
import { useProductsPaginated, useDeleteProduct, useUpdateStock } from '@features/stock/api/productos'
import { ROUTES } from '@shared/config/routes'
import type { ProductoStockItem } from '@entities/api/productosApi'

function ProductListPageInner() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useProductsPaginated({ page, limit, incluir_eliminados: true })
  const deleteProduct = useDeleteProduct()
  const updateStock = useUpdateStock()

  const [stockingProduct, setStockingProduct] = useState<ProductoStockItem | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<ProductoStockItem | null>(null)

  const handleEdit = (product: ProductoStockItem) => {
    navigate(ROUTES.PRODUCT_EDIT.replace(':id', String(product.id)))
  }

  const handleDelete = (product: ProductoStockItem) => {
    setDeletingProduct(product)
  }

  const handleStock = (product: ProductoStockItem) => {
    setStockingProduct(product)
  }

  const handleDeleteConfirm = () => {
    if (deletingProduct) {
      deleteProduct.mutate(deletingProduct.id, {
        onSuccess: () => setDeletingProduct(null),
      })
    }
  }

  const handleStockSubmit = (stockData: { cantidad: number; tipo: 'incremento' | 'absoluto' }) => {
    if (stockingProduct) {
      updateStock.mutate(
        { id: stockingProduct.id, data: stockData },
        { onSuccess: () => setStockingProduct(null) },
      )
    }
  }

  const products = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ZustandToastContainer />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        <button
          onClick={() => navigate(ROUTES.PRODUCT_CREATE)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ProductTable
          products={products}
          total={total}
          page={page}
          limit={limit}
          loading={isLoading}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStock={handleStock}
        />
      </div>

      <StockManager
        open={stockingProduct !== null}
        onClose={() => setStockingProduct(null)}
        onSubmit={handleStockSubmit}
        currentStock={stockingProduct?.stock_cantidad ?? 0}
        productName={stockingProduct?.nombre ?? ''}
      />

      <ProductDeleteConfirm
        open={deletingProduct !== null}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        productName={deletingProduct?.nombre ?? ''}
      />
    </div>
  )
}

export default function ProductListPage() {
  return (
    <ProtectedRoute requiredRoles={['STOCK', 'ADMIN']}>
      <ProductListPageInner />
    </ProtectedRoute>
  )
}
