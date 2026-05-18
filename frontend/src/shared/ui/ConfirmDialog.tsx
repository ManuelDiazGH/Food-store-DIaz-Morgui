/** ConfirmDialog — Modal dialog for confirming destructive actions. Minimalist. */
import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string | ReactNode
  onConfirm: () => void
  onClose: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmDisabled?: boolean
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onClose,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmDisabled = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!open) return null

  const confirmClasses =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-stone-800 hover:bg-black text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
        <div className="text-sm text-stone-600 mb-6">{message}</div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
