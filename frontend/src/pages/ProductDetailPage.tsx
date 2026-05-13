import { useParams } from 'react-router-dom'
import { ProductDetail } from '@features/catalogo/components/ProductDetail'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div className="text-center py-12 text-red-500">ID de producto inválido</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail productId={Number(id)} />
    </div>
  )
}