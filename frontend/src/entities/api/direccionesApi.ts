/** Direcciones API — TanStack Query hooks for delivery addresses. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import { useAuthStore } from '@features/auth/store/authStore'
import type { DireccionEntrega } from '@entities/types'

interface DireccionCreate {
  alias?: string
  linea1: string
  linea2?: string
  ciudad: string
  cp: string
  es_principal?: boolean
}

interface DireccionUpdate {
  alias?: string
  linea1?: string
  linea2?: string
  ciudad?: string
  cp?: string
}

const DIECCIONES_KEYS = {
  all: ['direcciones'] as const,
  list: (usuarioId: number) => ['direcciones', usuarioId] as const,
}

export function useDirecciones() {
  const user = useAuthStore((s) => s.user)
  const usuarioId = user?.id

  return useQuery<DireccionEntrega[]>({
    queryKey: DIECCIONES_KEYS.list(usuarioId!),
    queryFn: async () => {
      const { data } = await api.get<DireccionEntrega[]>(`/api/v1/direcciones/usuario/${usuarioId}`)
      return data
    },
    enabled: !!usuarioId,
  })
}

export function useCreateDireccion() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation<DireccionEntrega, Error, DireccionCreate>({
    mutationFn: async (payload) => {
      const { data } = await api.post<DireccionEntrega>('/api/v1/direcciones', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIECCIONES_KEYS.list(user!.id) })
    },
  })
}

export function useUpdateDireccion() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation<DireccionEntrega, Error, { id: number; data: DireccionUpdate }>({
    mutationFn: async ({ id, data }) => {
      const { data: updated } = await api.put<DireccionEntrega>(`/api/v1/direcciones/${id}`, data)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIECCIONES_KEYS.list(user!.id) })
    },
  })
}

export function useSetPrincipal() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation<DireccionEntrega, Error, number>({
    mutationFn: async (id) => {
      const { data } = await api.patch<DireccionEntrega>(`/api/v1/direcciones/${id}/principal`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIECCIONES_KEYS.list(user!.id) })
    },
  })
}

export function useDeleteDireccion() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/direcciones/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIECCIONES_KEYS.list(user!.id) })
    },
  })
}
