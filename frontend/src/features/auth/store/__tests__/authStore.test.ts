/** Tests para authStore (Zustand + persist). */
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'

// Reset store before each test
beforeEach(() => {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  })
  // Clear localStorage from previous persist
  localStorage.clear()
})

describe('authStore', () => {
  it('should start with default unauthenticated state', () => {
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should set tokens and mark as authenticated', () => {
    useAuthStore.getState().setTokens('access-123', 'refresh-456')
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access-123')
    expect(state.refreshToken).toBe('refresh-456')
    expect(state.isAuthenticated).toBe(true)
  })

  it('should set user and mark as authenticated', () => {
    const mockUser = { id: 1, email: 'test@test.com', nombre: 'Test', roles: ['CLIENT'], created_at: '2024-01-01T00:00:00Z' }
    useAuthStore.getState().setUser(mockUser as any)
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should clear auth state on logout', () => {
    useAuthStore.getState().setTokens('access-123', 'refresh-456')
    useAuthStore.getState().clearAuth()
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
