/** Tests para RoleGuard component. */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleGuard } from '../RoleGuard'
import { useAuthStore } from '@features/auth/store/authStore'

beforeEach(() => {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  })
})

describe('RoleGuard', () => {
  it('should show 403 when user has no roles', () => {
    useAuthStore.setState({
      user: { id: 1, email: 'test@test.com', nombre: 'Test', roles: [], created_at: '2024-01-01T00:00:00Z' },
      isAuthenticated: true,
    })
    render(<RoleGuard allowedRoles={['ADMIN']}><div>Admin Content</div></RoleGuard>)
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('should show 403 when user has wrong role', () => {
    useAuthStore.setState({
      user: { id: 1, email: 'test@test.com', nombre: 'Test', roles: ['CLIENT'], created_at: '2024-01-01T00:00:00Z' },
      isAuthenticated: true,
    })
    render(<RoleGuard allowedRoles={['ADMIN']}><div>Admin Content</div></RoleGuard>)
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
  })

  it('should render children when user has allowed role', () => {
    useAuthStore.setState({
      user: { id: 1, email: 'admin@test.com', nombre: 'Admin', roles: ['ADMIN'], created_at: '2024-01-01T00:00:00Z' },
      isAuthenticated: true,
    })
    render(<RoleGuard allowedRoles={['ADMIN']}><div>Admin Content</div></RoleGuard>)
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
    expect(screen.queryByText('Acceso denegado')).not.toBeInTheDocument()
  })

  it('should render children when user has one of multiple allowed roles', () => {
    useAuthStore.setState({
      user: { id: 1, email: 'stock@test.com', nombre: 'Stock', roles: ['STOCK'], created_at: '2024-01-01T00:00:00Z' },
      isAuthenticated: true,
    })
    render(<RoleGuard allowedRoles={['ADMIN', 'STOCK']}><div>Stock Content</div></RoleGuard>)
    expect(screen.getByText('Stock Content')).toBeInTheDocument()
  })

  it('should render Outlet when no children and allowed', () => {
    useAuthStore.setState({
      user: { id: 1, email: 'admin@test.com', nombre: 'Admin', roles: ['ADMIN'], created_at: '2024-01-01T00:00:00Z' },
      isAuthenticated: true,
    })
    // Should render Outlet (no error means it works)
    const { container } = render(<RoleGuard allowedRoles={['ADMIN']} />)
    expect(container.innerHTML).not.toContain('Acceso denegado')
  })
})
