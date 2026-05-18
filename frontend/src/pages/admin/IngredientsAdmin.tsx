/** IngredientsAdmin — Admin page for managing ingredients. */
import { useState } from 'react'
import { ProtectedRoute } from '@shared/utils/ProtectedRoute'
import { ZustandToastContainer } from '@shared/ui/Toast'
import { IngredientTable } from '@widgets/admin/IngredientTable'
import { IngredientForm } from '@widgets/admin/IngredientForm'
import { IngredientDeleteConfirm } from '@widgets/admin/IngredientDeleteConfirm'
import {
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from '@features/admin/api/ingredientes'
import type { IngredienteRead, IngredienteCreate, IngredienteUpdate } from '@entities/api/ingredientes'

function IngredientsAdminInner() {
  const createIngredient = useCreateIngredient()
  const updateIngredient = useUpdateIngredient()
  const deleteIngredient = useDeleteIngredient()

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<IngredienteRead | null>(null)
  const [deletingItem, setDeletingItem] = useState<IngredienteRead | null>(null)

  const handleEdit = (ingredient: IngredienteRead) => {
    setEditingItem(ingredient)
    setShowForm(true)
  }

  const handleDelete = (ingredient: IngredienteRead) => {
    setDeletingItem(ingredient)
  }

  const handleFormSubmit = (data: IngredienteCreate | IngredienteUpdate) => {
    if (editingItem) {
      updateIngredient.mutate(
        { id: editingItem.id, data: data as IngredienteUpdate },
        { onSuccess: () => setShowForm(false) },
      )
    } else {
      createIngredient.mutate(data as IngredienteCreate, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      deleteIngredient.mutate(deletingItem.id, {
        onSuccess: () => setDeletingItem(null),
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ZustandToastContainer />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Ingredientes</h1>
        <button
          onClick={() => {
            setEditingItem(null)
            setShowForm(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + Nuevo ingrediente
        </button>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-4">
        <IngredientTable onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      {/* Create/Edit form modal */}
      <IngredientForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        initialData={
          editingItem
            ? { id: editingItem.id, nombre: editingItem.nombre, es_alergeno: editingItem.es_alergeno }
            : null
        }
      />

      {/* Delete confirmation */}
      <IngredientDeleteConfirm
        open={deletingItem !== null}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        ingredientName={deletingItem?.nombre ?? ''}
      />
    </div>
  )
}

export default function IngredientsAdmin() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'STOCK']}>
      <IngredientsAdminInner />
    </ProtectedRoute>
  )
}