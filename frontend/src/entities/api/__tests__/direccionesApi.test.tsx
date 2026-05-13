/** Tests para direccionesApi hooks (TanStack Query + axios mock). */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDirecciones, useCreateDireccion, useDeleteDireccion, useSetPrincipal } from '../direccionesApi'
import { useAuthStore } from '@features/auth/store/authStore'
import { api } from '../axios'

// Mock axios
vi.mock('../axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    user: { id: 1, email: 'test@test.com', nombre: 'Test', roles: ['CLIENT'], created_at: '2024-01-01T00:00:00Z' },
    isAuthenticated: true,
    accessToken: 'test-token',
    refreshToken: 'test-refresh',
  })
})

describe('useDirecciones', () => {
  it('should fetch direcciones for authenticated user', async () => {
    const mockDirecciones = [
      { id: 1, alias: 'Casa', linea1: 'Av. Siempre Viva 123', ciudad: 'BSAS', cp: '1425', es_principal: true, usuario_id: 1 },
    ]
    vi.mocked(api.get).mockResolvedValue({ data: mockDirecciones })

    const { result } = renderHook(() => useDirecciones(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith('/api/v1/direcciones/usuario/1')
    expect(result.current.data).toEqual(mockDirecciones)
  })

  it('should not fetch when user is not authenticated', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, accessToken: null })
    const { result } = renderHook(() => useDirecciones(), { wrapper })
    expect(result.current.isFetching).toBe(false)
  })
})

describe('useCreateDireccion', () => {
  it('should create direccion and invalidate queries', async () => {
    const newDireccion = { id: 2, alias: 'Trabajo', linea1: 'Av. Corrientes 500', ciudad: 'BSAS', cp: '1043', es_principal: false, usuario_id: 1 }
    vi.mocked(api.post).mockResolvedValue({ data: newDireccion })

    const { result } = renderHook(() => useCreateDireccion(), { wrapper })
    result.current.mutate({ linea1: 'Av. Corrientes 500', ciudad: 'BSAS', cp: '1043' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.post).toHaveBeenCalledWith('/api/v1/direcciones', {
      linea1: 'Av. Corrientes 500', ciudad: 'BSAS', cp: '1043',
    })
  })
})

describe('useDeleteDireccion', () => {
  it('should delete direccion and invalidate queries', async () => {
    vi.mocked(api.delete).mockResolvedValue({})

    const { result } = renderHook(() => useDeleteDireccion(), { wrapper })
    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.delete).toHaveBeenCalledWith('/api/v1/direcciones/1')
  })
})

describe('useSetPrincipal', () => {
  it('should set direccion as principal', async () => {
    const mockResponse = { id: 1, es_principal: true }
    vi.mocked(api.patch).mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useSetPrincipal(), { wrapper })
    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.patch).toHaveBeenCalledWith('/api/v1/direcciones/1/principal')
  })
})
