import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@entities/api/axios'

export function useAssignRole(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rol_codigo: string) =>
      api.post(`/api/v1/usuarios/${userId}/roles`, { rol_codigo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
    },
  })
}

export function useRemoveUser(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/api/v1/usuarios/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}