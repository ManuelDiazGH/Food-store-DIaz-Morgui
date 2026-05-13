import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import { useAuthStore } from '@features/auth/store/authStore'
import type { LoginRequest, RegisterRequest, TokenResponse, UserResponse } from '@entities/types'

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation<TokenResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const { data } = await api.post<TokenResponse>('/api/v1/auth/login', credentials)
      return data
    },
    onSuccess: async (data) => {
      setTokens(data.access_token, data.refresh_token)
      const { data: me } = await api.get<UserResponse>('/api/v1/auth/me')
      setUser(me)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export function useRegister() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation<TokenResponse, Error, RegisterRequest>({
    mutationFn: async (payload: RegisterRequest) => {
      const { data } = await api.post<TokenResponse>('/api/v1/auth/register', payload)
      return data
    },
    onSuccess: async (data) => {
      setTokens(data.access_token, data.refresh_token)
      const { data: me } = await api.get<UserResponse>('/api/v1/auth/me')
      setUser(me)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery<UserResponse>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<UserResponse>('/api/v1/auth/me')
      return data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post('/api/v1/auth/logout', { refresh_token: refreshToken })
    },
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
    },
  })
}