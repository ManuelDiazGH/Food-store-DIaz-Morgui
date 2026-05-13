/** TanStack Query hooks for ingredient management. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  type IngredienteCreate,
  type IngredienteUpdate,
} from '@entities/api/ingredientes'
import { useToast } from '@shared/ui/Toast'

// ── Query Keys ─────────────────────────────────────────────────────

export const ingredientKeys = {
  all: ['ingredients'] as const,
  list: (params?: { alergeno?: boolean; offset?: number; limit?: number }) =>
    ['ingredients', 'list', params] as const,
}

// ── Queries ─────────────────────────────────────────────────────────

export function useIngredients(
  params?: { alergeno?: boolean; offset?: number; limit?: number },
) {
  return useQuery({
    queryKey: ingredientKeys.list(params),
    queryFn: () => getAllIngredients(params),
  })
}

// ── Mutations ───────────────────────────────────────────────────────

export function useCreateIngredient() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (data: IngredienteCreate) => createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.all })
      toast.success('Ingrediente creado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear ingrediente')
    },
  })
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredienteUpdate }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.all })
      toast.success('Ingrediente actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar ingrediente')
    },
  })
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.all })
      toast.success('Ingrediente eliminado exitosamente')
    },
    onError: (error: Error) => {
      const msg = (error as any)?.response?.data?.detail || error.message || 'Error al eliminar ingrediente'
      toast.error(msg)
    },
  })
}