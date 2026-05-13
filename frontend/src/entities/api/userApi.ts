import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import { getErrorMessage } from '@shared/utils/errorHandler'
import type { Usuario, RolCodigo } from '@entities/types'

export function useUsers() {
  return useQuery<Usuario[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<Usuario[]>('/api/v1/usuarios')
      return res.data
    },
  })
}

export function useUser(id: number) {
  return useQuery<Usuario>({
    queryKey: ['users', id],
    queryFn: async () => {
      const res = await api.get<Usuario>(`/api/v1/usuarios/${id}`)
      return res.data
    },
    enabled: id > 0,
  })
}

interface UpdateUserPayload {
  id: number
  nombre?: string
  email?: string
  telefono?: string
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation<Usuario, Error, UpdateUserPayload>({
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

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/usuarios/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error))
    },
  })
}

interface AssignRolePayload {
  id: number
  rol_codigo: RolCodigo
}

export function useAssignRole() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, AssignRolePayload>({
    mutationFn: async ({ id, rol_codigo }) => {
      await api.post(`/api/v1/usuarios/${id}/roles`, { rol_codigo })
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