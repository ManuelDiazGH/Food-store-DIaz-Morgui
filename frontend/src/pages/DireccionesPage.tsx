import { useState } from 'react'
import { useDirecciones, useCreateDireccion, useUpdateDireccion, useDeleteDireccion, useSetPrincipal } from '@entities/api/direccionesApi'
import { DireccionCard, DireccionForm } from '@features/direcciones'

export default function DireccionesPage() {
  const { data: direcciones, isLoading, error } = useDirecciones()
  const createDireccion = useCreateDireccion()
  const updateDireccion = useUpdateDireccion()
  const deleteDireccion = useDeleteDireccion()
  const setPrincipal = useSetPrincipal()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const editingDireccion = editingId != null
    ? direcciones?.find((d) => d.id === editingId)
    : undefined

  function handleCreate(data: { alias: string; linea1: string; linea2: string; ciudad: string; cp: string; es_principal: boolean }) {
    createDireccion.mutate(data, {
      onSuccess: () => {
        setShowForm(false)
      },
    })
  }

  function handleUpdate(data: { alias: string; linea1: string; linea2: string; ciudad: string; cp: string; es_principal: boolean }) {
    if (editingId == null) return
    updateDireccion.mutate(
      { id: editingId, data },
      {
        onSuccess: () => {
          setEditingId(null)
        },
      },
    )
  }

  function handleDelete() {
    if (confirmDeleteId == null) return
    deleteDireccion.mutate(confirmDeleteId, {
      onSuccess: () => {
        setConfirmDeleteId(null)
      },
    })
  }

  const isMutating = createDireccion.isPending || updateDireccion.isPending || deleteDireccion.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Mis Direcciones</h1>
        {!showForm && editingId == null && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
          >
            + Nueva dirección
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showForm || editingId != null) && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            {editingId ? 'Editar dirección' : 'Nueva dirección'}
          </h2>
          <DireccionForm
            initialData={editingDireccion}
            onSubmit={editingId ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingId(null)
            }}
            isLoading={isMutating}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-stone-400">Cargando direcciones...</div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-2">Error al cargar direcciones</p>
          <button
            onClick={() => window.location.reload()}
            className="text-brand-600 hover:underline text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && direcciones?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <p className="text-stone-500 mb-4">No tenés direcciones guardadas</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Agregar mi primera dirección
          </button>
        </div>
      )}

      {/* Address list */}
      {!isLoading && !error && direcciones && direcciones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {direcciones.map((dir) => (
            <DireccionCard
              key={dir.id}
              direccion={dir}
              onEdit={(id) => {
                setShowForm(false)
                setEditingId(id)
              }}
              onDelete={(id) => setConfirmDeleteId(id)}
              onSetPrincipal={(id) => setPrincipal.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId != null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Eliminar dirección</h3>
            <p className="text-sm text-stone-600 mb-6">
              ¿Estás seguro de eliminar esta dirección? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
                disabled={deleteDireccion.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteDireccion.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteDireccion.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
