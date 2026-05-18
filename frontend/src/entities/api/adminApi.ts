import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import { getErrorMessage } from '@shared/utils/errorHandler'
import type { MetricasCompletas, PedidoPorEstado, TopProducto, Usuario, VentaPorPeriodo } from '@entities/types'

export function useDashboardMetrics(desde?: string, hasta?: string) {
  return useQuery<MetricasCompletas>({
    queryKey: ['admin', 'metrics', desde, hasta],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
      const qs = params.toString()
      const { data } = await api.get<MetricasCompletas>(`/api/v1/admin/metricas/completas${qs ? `?${qs}` : ''}`)
      return data
    },
  })
}

export function useVentasPorPeriodo(desde?: string, hasta?: string, granularidad?: string) {
  return useQuery<VentaPorPeriodo[]>({
    queryKey: ['admin', 'ventas', desde, hasta, granularidad],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
      if (granularidad) params.set('granularidad', granularidad)
      const qs = params.toString()
      const { data } = await api.get<VentaPorPeriodo[]>(`/api/v1/admin/metricas/ventas${qs ? `?${qs}` : ''}`)
      return data
    },
  })
}

export function useTopProductos(top?: number, desde?: string, hasta?: string) {
  return useQuery<TopProducto[]>({
    queryKey: ['admin', 'top-productos', top, desde, hasta],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (top) params.set('top', String(top))
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
      const qs = params.toString()
      const { data } = await api.get<TopProducto[]>(`/api/v1/admin/metricas/productos-top${qs ? `?${qs}` : ''}`)
      return data
    },
  })
}

export function usePedidosPorEstado(desde?: string, hasta?: string) {
  return useQuery<PedidoPorEstado[]>({
    queryKey: ['admin', 'pedidos-estado', desde, hasta],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
      const qs = params.toString()
      const { data } = await api.get<PedidoPorEstado[]>(`/api/v1/admin/metricas/pedidos-por-estado${qs ? `?${qs}` : ''}`)
      return data
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation<Usuario, Error, { id: number; activo: boolean }>({
    mutationFn: async ({ id, activo }) => {
      const { data } = await api.patch<Usuario>(`/api/v1/usuarios/${id}/estado`, { activo })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error))
    },
  })
}

export function useUpdateUserData() {
  const queryClient = useQueryClient()

  return useMutation<Usuario, Error, { id: number; nombre?: string; email?: string; telefono?: string }>({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.put<Usuario>(`/api/v1/usuarios/${id}`, data)
      return res.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error))
    },
  })
}
