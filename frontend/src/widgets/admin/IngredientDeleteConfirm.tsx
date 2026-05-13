/** IngredientDeleteConfirm — Confirmation dialog for ingredient deletion. */
import { ConfirmDialog } from '@shared/ui/ConfirmDialog'

interface IngredientDeleteConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  ingredientName: string
}

export function IngredientDeleteConfirm({
  open,
  onClose,
  onConfirm,
  ingredientName,
}: IngredientDeleteConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Eliminar ingrediente"
      message={`¿Está seguro de eliminar el ingrediente "${ingredientName}"? Se dará de baja lógicamente y no se podrá asociar a nuevos productos.`}
      confirmLabel="Eliminar"
      variant="danger"
    />
  )
}