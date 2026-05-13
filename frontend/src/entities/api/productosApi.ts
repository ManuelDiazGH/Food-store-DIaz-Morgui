/** Productos API — TanStack Query hooks for product endpoints. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import type {
  ProductoCreate,
  ProductoDetalleRead,
  ProductoListResponse,
  ProductoUpdate,
  StockUpdate,
} from '@entities/types'

// ── Catalog (public) ────────────────────────────────────────────────

export interface ProductFilters {
  categoria?: number
  busqueda?: string
  excluir_alergenos?: number[]
  page?: number
  limit?: number
  incluir_eliminados?: boolean
}

export function useProductos(filters: ProductFilters = {}) {
  const params: Record<string, string | number> = {}
  if (filters.categoria) params.categoria = filters.categoria
  if (filters.busqueda) params.busqueda = filters.busqueda
  if (filters.excluir_alergenos?.length) params.excluir_alergenos = filters.excluir_alergenos.join(',')
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit
  if (filters.incluir_eliminados) params.incluir_eliminados = 'true'

  return useQuery<ProductoListResponse>({
    queryKey: ['productos', 'catalog', filters],
    queryFn: async () => {
      const { data } = await api.get<ProductoListResponse>('/api/v1/productos', { params })
      return data
    },
  })
}

export function useProductoDetalle(id: number) {
  return useQuery<ProductoDetalleRead>({
    queryKey: ['productos', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get<ProductoDetalleRead>(`/api/v1/productos/${id}`)
      return data
    },
    enabled: !!id,
  })
}

// ── CRUD (admin) ────────────────────────────────────────────────────

export function useCreateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ProductoCreate) => {
      const { data } = await api.post('/api/v1/productos', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useUpdateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ProductoUpdate }) => {
      const { data } = await api.put(`/api/v1/productos/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useDeleteProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/v1/productos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

// ── M2M associations ────────────────────────────────────────────────

export function useAssociateCategorias() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, categoria_ids }: { id: number; categoria_ids: number[] }) => {
      const { data } = await api.put(`/api/v1/productos/${id}/categorias`, { categoria_ids })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useAssociateIngredientes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ingredientes }: { id: number; ingredientes: Array<{ ingrediente_id: number; es_removible: boolean }> }) => {
      const { data } = await api.put(`/api/v1/productos/${id}/ingredientes`, { ingredientes })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

// ── Stock management ─────────────────────────────────────────────────

export function useUpdateStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data: stockData }: { id: number; data: StockUpdate }) => {
      const { data } = await api.patch(`/api/v1/productos/${id}/stock`, stockData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}