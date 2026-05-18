import type { DireccionEntrega } from '@entities/types'

interface DireccionCardProps {
  direccion: DireccionEntrega
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onSetPrincipal: (id: number) => void
}

export function DireccionCard({ direccion, onEdit, onDelete, onSetPrincipal }: DireccionCardProps) {
  const fullAddress = [direccion.linea1, direccion.linea2].filter(Boolean).join(', ')

  return (
    <div
      className={`relative rounded-lg border p-4 transition-colors ${
        direccion.es_principal
          ? 'border-brand-300 bg-brand-50'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      {/* Default badge */}
      {direccion.es_principal && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-brand-600 text-white text-xs font-medium rounded-full">
          Principal
        </span>
      )}

      {/* Alias */}
      {direccion.alias && (
        <h3 className="text-sm font-semibold text-stone-900 mb-1 pr-20">{direccion.alias}</h3>
      )}

      {/* Address */}
      <p className="text-sm text-stone-700">{fullAddress}</p>
      <p className="text-sm text-stone-500">
        {direccion.ciudad}, CP {direccion.cp}
      </p>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {!direccion.es_principal && (
          <button
            onClick={() => onSetPrincipal(direccion.id)}
            className="text-xs px-2 py-1 rounded border border-brand-300 text-brand-700 hover:bg-brand-100 transition-colors"
          >
            Establecer como principal
          </button>
        )}
        <button
          onClick={() => onEdit(direccion.id)}
          className="text-xs px-2 py-1 rounded border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(direccion.id)}
          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
