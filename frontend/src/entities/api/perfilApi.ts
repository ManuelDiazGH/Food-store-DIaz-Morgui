/** Perfil API — TanStack Query hooks for profile endpoints. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import { useAuthStore } from '@features/auth/store/authStore'
import type { PerfilRead, PerfilUpdate, PasswordChange } from '@entities/types'

export function usePerfil() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery<PerfilRead>({
    queryKey: ['perfil'],
    queryFn: async () => {
      const { data } = await api.get<PerfilRead>('/api/v1/perfil')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useUpdatePerfil() {
  const queryClient = useQueryClient()
  return useMutation<PerfilRead, Error, PerfilUpdate>({
    mutationFn: async (payload) => {
      const { data } = await api.put<PerfilRead>('/api/v1/perfil', payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] })
      // Update auth store with new name
      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({ ...user, nombre: data.nombre, telefono: data.telefono ?? undefined })
      }
    },
  })
}

export function useChangePassword() {
  return useMutation<{ message: string }, Error, PasswordChange>({
    mutationFn: async (payload) => {
      const { data } = await api.put<{ message: string }>('/api/v1/perfil/password', payload)
      return data
    },
  })
}