/** Productos API — Raw functions and TanStack Query hooks for product endpoints. */
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

// ── Stock product list item ──────────────────────────────────────────

export interface ProductoStockItem {
  id: number
  nombre: string
  precio_base: number
  stock_cantidad: number
  disponible: boolean
  imagen?: string
  categorias: string[]
  created_at: string
  eliminado_en?: string
}

export interface ProductoStockListResponse {
  items: ProductoStockItem[]
  total: number
  page: number
  limit: number
}

// ── Raw API functions (for feature hooks with toast) ─────────────────

export async function getProductosStock(
  params?: ProductFilters,
): Promise<ProductoStockListResponse> {
  const queryParams: Record<string, string | number> = {}
  if (params?.categoria) queryParams.categoria = params.categoria
  if (params?.busqueda) queryParams.busqueda = params.busqueda
  if (params?.excluir_alergenos?.length) queryParams.excluir_alergenos = params.excluir_alergenos.join(',')
  if (params?.page) queryParams.page = params.page
  if (params?.limit) queryParams.limit = params.limit
  if (params?.incluir_eliminados) queryParams.incluir_eliminados = 'true'
  const { data } = await api.get<ProductoStockListResponse>('/api/v1/productos', { params: queryParams })
  return data
}

export async function getProductoById(id: number): Promise<ProductoDetalleRead> {
  const { data } = await api.get<ProductoDetalleRead>(`/api/v1/productos/${id}`)
  return data
}

export async function createProducto(payload: ProductoCreate): Promise<unknown> {
  const { data } = await api.post('/api/v1/productos', payload)
  return data
}

export async function updateProducto(id: number, payload: ProductoUpdate): Promise<unknown> {
  const { data } = await api.put(`/api/v1/productos/${id}`, payload)
  return data
}

export async function deleteProducto(id: number): Promise<void> {
  await api.delete(`/api/v1/productos/${id}`)
}

export async function associateProductoCategorias(id: number, categoria_ids: number[]): Promise<unknown> {
  const { data } = await api.put(`/api/v1/productos/${id}/categorias`, { categoria_ids })
  return data
}

export async function associateProductoIngredientes(
  id: number,
  ingredientes: Array<{ ingrediente_id: number; es_removible: boolean }>,
): Promise<unknown> {
  const { data } = await api.put(`/api/v1/productos/${id}/ingredientes`, { ingredientes })
  return data
}

export async function updateProductoStock(id: number, stockData: StockUpdate): Promise<unknown> {
  const { data } = await api.patch(`/api/v1/productos/${id}/stock`, stockData)
  return data
}