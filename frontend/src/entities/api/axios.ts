/** Axios instance with JWT interceptor and refresh token handling. */
import axios from 'axios'
import { useAuthStore } from '@features/auth/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach JWT ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: handle 401 → refresh ──────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si es 401 y no estamos ya refrescando
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Encolar request hasta que el refresh termine
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { refreshToken, setTokens, clearAuth } = useAuthStore.getState()

        if (!refreshToken) {
          clearAuth()
          return Promise.reject(error)
        }

        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token, refresh_token: new_refresh } = response.data
        setTokens(access_token, new_refresh)

        processQueue(null, access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)