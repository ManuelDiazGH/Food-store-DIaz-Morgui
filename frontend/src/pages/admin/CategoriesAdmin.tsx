/** CategoriesAdmin — Admin page for managing category hierarchy. */
import { useState, useCallback } from 'react'
import { ProtectedRoute } from '@shared/utils/ProtectedRoute'
import { ZustandToastContainer } from '@shared/ui/Toast'
import { CategoryTree } from '@widgets/admin/CategoryTree'
import { CategoryForm } from '@widgets/admin/CategoryForm'
import { CategoryDeleteConfirm } from '@widgets/admin/CategoryDeleteConfirm'
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@features/admin/api/categorias'
import {
  useCategories,
} from '@features/admin/api/categorias'
import type { CategoriaCreate, CategoriaUpdate } from '@entities/api/categorias'

interface CategoryDetail {
  id: number
  nombre: string
  descripcion: string | null
  padre_id: number | null
}

function CategoriesAdminInner() {
  const { data: tree = [], isLoading: treeLoading } = useCategoryTree()
  const { data: flatList = [] } = useCategories()
  const createCat = useCreateCategory()
  const updateCat = useUpdateCategory()
  const deleteCat = useDeleteCategory()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDetail | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Find selected category details from flat list
  const selectedCategory = flatList.find((c) => c.id === selectedId) ?? null

  // Check if a category has subcategorias
  const hasSubcategorias = useCallback(
    (id: number): boolean => {
      return flatList.some((c) => c.padre_id === id && !c.eliminado_en)
    },
    [flatList],
  )

  const handleSelect = (id: number | null) => setSelectedId(id)

  const handleEdit = (id: number) => {
    const cat = flatList.find((c) => c.id === id)
    if (cat) {
      setEditingCategory({
        id: cat.id,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        padre_id: cat.padre_id,
      })
      setShowForm(true)
    }
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
  }

  const handleFormSubmit = (data: CategoriaCreate | CategoriaUpdate) => {
    if (editingCategory) {
      updateCat.mutate(
        { id: editingCategory.id, data: data as CategoriaUpdate },
        { onSuccess: () => setShowForm(false) },
      )
    } else {
      createCat.mutate(data as CategoriaCreate, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteCat.mutate(deletingId, {
        onSuccess: () => {
          setDeletingId(null)
          if (selectedId === deletingId) setSelectedId(null)
        },
      })
    }
  }

  const deletingCategory = flatList.find((c) => c.id === deletingId)
  const deletingName = deletingCategory?.nombre ?? ''
  const deletingHasSubs = deletingId ? hasSubcategorias(deletingId) : false

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ZustandToastContainer />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Categorías</h1>
        <button
          onClick={() => {
            setEditingCategory(null)
            setShowForm(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + Nueva categoría
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree panel */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-stone-200 p-4">
          <h2 className="text-sm font-medium text-stone-500 uppercase mb-3">
            Árbol de categorías
          </h2>
          {treeLoading ? (
            <div className="text-center py-8 text-stone-400">Cargando...</div>
          ) : (
            <CategoryTree
              tree={tree}
              selectedId={selectedId}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Detail panel */}
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <h2 className="text-sm font-medium text-stone-500 uppercase mb-3">
            Detalle
          </h2>
          {selectedCategory ? (
            <div className="space-y-3">
              <div>
                <span className="text-xs text-stone-500">Nombre</span>
                <p className="text-sm font-medium text-stone-900">
                  {selectedCategory.nombre}
                </p>
              </div>
              <div>
                <span className="text-xs text-stone-500">Descripción</span>
                <p className="text-sm text-stone-700">
                  {selectedCategory.descripcion || '—'}
                </p>
              </div>
              <div>
                <span className="text-xs text-stone-500">ID</span>
                <p className="text-sm text-stone-700">{selectedCategory.id}</p>
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(selectedCategory.id)}
                  className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(selectedCategory.id)}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-400">
              Seleccioná una categoría del árbol
            </p>
          )}
        </div>
      </div>

      {/* Create/Edit form modal */}
      <CategoryForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        treeData={tree}
      />

      {/* Delete confirmation */}
      <CategoryDeleteConfirm
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        categoryName={deletingName}
        hasSubcategories={deletingHasSubs}
      />
    </div>
  )
}

export default function CategoriesAdmin() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'STOCK']}>
      <CategoriesAdminInner />
    </ProtectedRoute>
  )
}