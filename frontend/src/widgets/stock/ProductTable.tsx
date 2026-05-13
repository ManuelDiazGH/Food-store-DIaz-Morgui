/** ProductTable — Paginated table of products for stock management. */
import { DataTable, type Column } from '@shared/ui/DataTable'
import type { ProductoStockItem } from '@entities/api/productosApi'

interface ProductTableProps {
  products: ProductoStockItem[]
  total: number
  page: number
  limit: number
  loading: boolean
  onPageChange: (page: number) => void
  onEdit: (product: ProductoStockItem) => void
  onDelete: (product: ProductoStockItem) => void
  onStock: (product: ProductoStockItem) => void
}

export function ProductTable({
  products,
  total,
  page,
  limit,
  loading,
  onPageChange,
  onEdit,
  onDelete,
  onStock,
}: ProductTableProps) {
  const columns: Column<ProductoStockItem>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (row) => (
        <span className="font-medium text-gray-900">{row.nombre}</span>
      ),
    },
    {
      key: 'precio_base',
      label: 'Precio',
      render: (row) => (
        <span>${Number(row.precio_base).toFixed(2)}</span>
      ),
    },
    {
      key: 'stock_cantidad',
      label: 'Stock',
      render: (row) =>
        row.stock_cantidad < 10 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            {row.stock_cantidad}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            {row.stock_cantidad}
          </span>
        ),
    },
    {
      key: 'disponible',
      label: 'Disponible',
      render: (row) =>
        row.disponible ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Sí
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            No
          </span>
        ),
    },
    {
      key: 'categorias',
      label: 'Categorías',
      render: (row) => (
        <span className="text-gray-600">
          {row.categorias?.length ? row.categorias.join(', ') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="text-sm text-blue-600 hover:underline"
          >
            Editar
          </button>
          <button
            onClick={() => onStock(row)}
            className="text-sm text-green-600 hover:underline"
          >
            Stock
          </button>
          <button
            onClick={() => onDelete(row)}
            className="text-sm text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">Cargando...</div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={products}
      total={total}
      page={page}
      limit={limit}
      onPageChange={onPageChange}
      emptyMessage="No hay productos para mostrar"
    />
  )
}
