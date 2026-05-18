/** ProductCreatePage — Create a new product with categories and ingredients. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProtectedRoute } from '@shared/utils/ProtectedRoute'
import { ZustandToastContainer } from '@shared/ui/Toast'
import { ProductForm, type ProductFormData } from '@widgets/stock/ProductForm'
import { useCreateProduct, useAssociateCategorias, useAssociateIngredientes } from '@features/stock/api/productos'
import { ROUTES } from '@shared/config/routes'

function ProductCreatePageInner() {
  const navigate = useNavigate()
  const createProduct = useCreateProduct()
  const associateCategorias = useAssociateCategorias()
  const associateIngredientes = useAssociateIngredientes()

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const created = await createProduct.mutateAsync({
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        precio_base: data.precio_base,
        stock_cantidad: data.stock_cantidad,
        imagen: data.imagen || undefined,
        disponible: data.disponible,
      })
      const productId = (created as { id: number }).id

      if (data.categoria_ids.length > 0) {
        await associateCategorias.mutateAsync({ id: productId, categoria_ids: data.categoria_ids })
      }
      if (data.ingredientes.length > 0) {
        await associateIngredientes.mutateAsync({ id: productId, ingredientes: data.ingredientes })
      }

      navigate(ROUTES.PRODUCTS)
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold text-stone-900 mt-2">Nuevo Producto</h1>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <ProductForm
          open={true}
          onClose={() => navigate(ROUTES.PRODUCTS)}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default function ProductCreatePage() {
  return (
    <ProtectedRoute requiredRoles={['STOCK', 'ADMIN']}>
      <ProductCreatePageInner />
    </ProtectedRoute>
  )
}
