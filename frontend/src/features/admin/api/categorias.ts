/** TanStack Query hooks for category management. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCategoryTree,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoriaCreate,
  type CategoriaUpdate,
} from '@entities/api/categorias'
import { useToast } from '@shared/ui/Toast'

// ── Query Keys ─────────────────────────────────────────────────────

export const categoryKeys = {
  all: ['categories'] as const,
  tree: ['categories', 'tree'] as const,
  list: (offset?: number, limit?: number) =>
    ['categories', 'list', offset, limit] as const,
}

// ── Queries ─────────────────────────────────────────────────────────

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree,
    queryFn: getCategoryTree,
  })
}

export function useCategories(offset = 0, limit = 100) {
  return useQuery({
    queryKey: categoryKeys.list(offset, limit),
    queryFn: () => getAllCategories(offset, limit),
  })
}

// ── Mutations ───────────────────────────────────────────────────────

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (data: CategoriaCreate) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear categoría')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoría actualizada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar categoría')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoría eliminada exitosamente')
    },
    onError: (error: Error) => {
      const msg = (error as any)?.response?.data?.detail || error.message || 'Error al eliminar categoría'
      toast.error(msg)
    },
  })
}