/** ProductDeleteConfirm — Confirmation dialog for product soft-deletion. */
import { ConfirmDialog } from '@shared/ui/ConfirmDialog'

interface ProductDeleteConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
}

export function ProductDeleteConfirm({
  open,
  onClose,
  onConfirm,
  productName,
}: ProductDeleteConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Eliminar producto"
      message={`¿Está seguro de eliminar el producto "${productName}"? Se dará de baja lógicamente y no estará disponible para nuevos pedidos.`}
      confirmLabel="Eliminar"
      variant="danger"
    />
  )
}
