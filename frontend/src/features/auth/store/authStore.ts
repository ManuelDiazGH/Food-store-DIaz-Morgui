/** Auth store — Zustand state management for authentication.

Manages: user session, access/refresh tokens, login/logout actions.
State separation: this is CLIENT state (auth session), NOT server state.
Server state (user data fetching) should use TanStack Query.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserResponse } from '@entities/types'

interface AuthState {
  // ── State ────────────────────────────────────────────────────
  accessToken: string | null
  refreshToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean

  // ── Actions ──────────────────────────────────────────────────
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: UserResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ── Initial state ──────────────────────────────────────
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      // ── Actions ─────────────────────────────────────────────
      setTokens: (accessToken: string, refreshToken: string) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user: UserResponse) =>
        set({ user, isAuthenticated: true }),

      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)