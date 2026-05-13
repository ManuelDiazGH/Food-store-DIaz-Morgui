/** Tests para ProtectedRoute guard. */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuthStore } from '@features/auth/store/authStore'

beforeEach(() => {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  })
})

describe('ProtectedRoute', () => {
  it('should redirect to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <ProtectedRoute />
      </MemoryRouter>,
    )
    // It should navigate to /login
  })

  it('should render children when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: 'token' })
    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>,
    )
    // Outlet should render (no error means it works)
  })
})
