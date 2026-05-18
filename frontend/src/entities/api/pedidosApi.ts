/** Pedidos API — TanStack Query hooks for order management. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import { useAuthStore } from '@features/auth/store/authStore'
import { useCartStore } from '@features/cart/store/cartStore'
import type { Pedido, Pago, HistorialEstadoPedido, PedidoListResponse } from '@entities/types'

interface CrearPedidoRequest {
  forma_pago_codigo: string
  direccion_id?: number
  notas?: string
  items: Array<{
    producto_id: number
    cantidad: number
    personalizacion?: number[]
  }>
}

interface ValidarItemRequest {
  producto_id: number
  cantidad: number
  precio_original: number
}

interface ValidarItemsRequest {
  items: ValidarItemRequest[]
}

interface ItemValidado {
  producto_id: number
  nombre: string
  disponible: boolean
  hay_stock: boolean
  stock_disponible: number
  precio_actual: number
  precio_original: number
  hubo_cambio_precio: boolean
}

interface ValidarItemsResponse {
  valido: boolean
  items: ItemValidado[]
  errores: string[]
}

const PEDIDOS_KEYS = {
  all: ['pedidos'] as const,
  list: (usuarioId: number) => ['pedidos', usuarioId] as const,
  allPedidos: ['pedidos', 'all'] as const,
  detail: (id: number) => ['pedidos', id] as const,
  historial: (id: number) => ['pedidos', id, 'historial'] as const,
  pagos: (pedidoId: number) => ['pagos', pedidoId] as const,
}

export function usePedidos() {
  const user = useAuthStore((s) => s.user)
  const usuarioId = user?.id

  return useQuery<Pedido[]>({
    queryKey: PEDIDOS_KEYS.list(usuarioId!),
    queryFn: async () => {
      const { data } = await api.get<PedidoListResponse>(`/api/v1/pedidos?usuario_id=${usuarioId}`)
      return data.items
    },
    enabled: !!usuarioId,
  })
}

export function usePedidoDetalle(id: number) {
  return useQuery<Pedido>({
    queryKey: PEDIDOS_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Pedido>(`/api/v1/pedidos/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useHistorialPedido(id: number) {
  return useQuery<HistorialEstadoPedido[]>({
    queryKey: PEDIDOS_KEYS.historial(id),
    queryFn: async () => {
      const { data } = await api.get<HistorialEstadoPedido[]>(`/api/v1/pedidos/${id}/historial`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreatePedido() {
  const queryClient = useQueryClient()

  return useMutation<Pedido, Error, CrearPedidoRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Pedido>('/api/v1/pedidos', payload)
      return data
    },
    onSuccess: () => {
      // Invalidamos el prefijo ['pedidos'] para que también se refresque el
      // panel admin/gestor (no solo la lista del usuario actual).
      queryClient.invalidateQueries({ queryKey: PEDIDOS_KEYS.all })
      // Clear cart after successful order
      useCartStore.getState().clearCart()
    },
  })
}

export function useValidarPedido() {
  return useMutation<ValidarItemsResponse, Error, ValidarItemsRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post<ValidarItemsResponse>('/api/v1/pedidos/validar', payload)
      return data
    },
  })
}

// ── Pagos ───────────────────────────────────────────────────────

interface IniciarPagoRequest {
  pedido_id: number
  forma_pago_codigo: string
}

interface IniciarPagoResponse {
  pago: Pago
  init_point: string
  mp_payment_id?: string
}

export function useIniciarPago() {
  return useMutation<IniciarPagoResponse, Error, IniciarPagoRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post<IniciarPagoResponse>('/api/v1/pagos/crear', payload)
      return data
    },
  })
}

export function usePagoByPedido(pedidoId: number) {
  return useQuery<Pago[]>({
    queryKey: PEDIDOS_KEYS.pagos(pedidoId),
    queryFn: async () => {
      const { data } = await api.get<Pago[]>(`/api/v1/pagos/pedido/${pedidoId}`)
      return data
    },
    enabled: !!pedidoId,
  })
}

export function useSyncPago(pedidoId: number) {
  const queryClient = useQueryClient()

  return useMutation<Pago | null, Error>({
    mutationFn: async () => {
      // silent: true → polling en background, no debe disparar toasts globales.
      const { data } = await api.post<Pago | null>(
        `/api/v1/pagos/pedido/${pedidoId}/sync`,
        undefined,
        { silent: true } as never,
      )
      return data
    },
    onSuccess: () => {
      // El sync con MP puede haber auto-transicionado el pedido a CONFIRMADO,
      // así que invalidamos el prefijo entero ['pedidos'] para refrescar
      // detalles, listas del cliente y panel admin.
      queryClient.invalidateQueries({ queryKey: PEDIDOS_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PEDIDOS_KEYS.pagos(pedidoId) })
    },
  })
}

// ── Paginated list (Sprint 7) ────────────────────────────────────

export interface OrderFilters {
  q?: string
  estado?: string
  desde?: string
  hasta?: string
  page?: number
  limit?: number
}

export function useAllPedidosPaginated(filters: OrderFilters = {}) {
  return useQuery<PedidoListResponse>({
    queryKey: ['pedidos', 'all', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (filters.q) params.q = filters.q
      if (filters.estado) params.estado = filters.estado
      if (filters.desde) params.desde = filters.desde
      if (filters.hasta) params.hasta = filters.hasta
      if (filters.page) params.page = filters.page
      if (filters.limit) params.limit = filters.limit
      const { data } = await api.get<PedidoListResponse>('/api/v1/pedidos', { params })
      return data
    },
    // Refresh automático cada 30s. La UI del panel lo promete y los operarios
    // ven los cambios sin tener que recargar la página manualmente.
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    // Forzamos a "stale" para que invalidateQueries de mutaciones siempre
    // dispare refetch (el default de 5min ocultaba transiciones recién hechas).
    staleTime: 0,
  })
}

// ── Admin / Gestor hooks ────────────────────────────────────────

export function useAllPedidos() {
  return useQuery<Pedido[]>({
    queryKey: PEDIDOS_KEYS.allPedidos,
    queryFn: async () => {
      const { data } = await api.get<PedidoListResponse>('/api/v1/pedidos')
      return data.items
    },
  })
}

interface EstadoUpdateRequest {
  estado_hasta: string
  observacion?: string
}

export function useTransicionarEstado(pedidoId: number) {
  const queryClient = useQueryClient()

  return useMutation<Pedido, Error, EstadoUpdateRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.patch<Pedido>(`/api/v1/pedidos/${pedidoId}/estado`, payload)
      return data
    },
    onSuccess: () => {
      // Invalidación amplia: el cambio de estado afecta listas (cliente y
      // panel), el detalle del pedido y su historial. Usamos prefijo
      // ['pedidos'] para barrer todas las variantes paginadas/filtradas.
      queryClient.invalidateQueries({ queryKey: PEDIDOS_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PEDIDOS_KEYS.detail(pedidoId) })
      queryClient.invalidateQueries({ queryKey: PEDIDOS_KEYS.historial(pedidoId) })
    },
  })
}

export type { CrearPedidoRequest, ValidarItemsRequest, ValidarItemsResponse, ItemValidado, IniciarPagoResponse, EstadoUpdateRequest }
