/** CategoryDeleteConfirm — Confirmation dialog for category deletion. */
import { ConfirmDialog } from '@shared/ui/ConfirmDialog'

interface CategoryDeleteConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  categoryName: string
  hasSubcategories: boolean
}

export function CategoryDeleteConfirm({
  open,
  onClose,
  onConfirm,
  categoryName,
  hasSubcategories,
}: CategoryDeleteConfirmProps) {
  if (hasSubcategories) {
    return (
<ConfirmDialog
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
        title="No se puede eliminar"
        message={
          <div>
            <p className="mb-2">
              No se puede eliminar la categoría <strong>"{categoryName}"</strong> porque tiene
              subcategorías activas.
            </p>
            <p className="text-gray-500">
              Reasigne o elimine las subcategorías primero.
            </p>
          </div>
        }
        confirmLabel="Entendido"
        confirmDisabled={true}
        variant="warning"
      />
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Eliminar categoría"
      message={`¿Está seguro de eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar"
      variant="danger"
    />
  )
}