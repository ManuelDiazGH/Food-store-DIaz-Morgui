import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
  exiting?: boolean
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 5
const AUTO_DISMISS_MS = 4000

const typeStyles: Record<ToastType, string> = {
  success: 'bg-brand-600 text-white',
  error:   'bg-red-600 text-white',
  warning: 'bg-amber-600 text-white',
  info:    'bg-blue-600 text-white',
}

const typeIcons: Record<ToastType, string> = {
  success: '\u2713',
  error:   '\u2717',
  warning: '\u26A0',
  info:    '\u2139',
}

let toastCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastCounter
    setToasts((prev) => {
      const next = [...prev, { id, type, message }]
      if (next.length > MAX_TOASTS) next.shift()
      return next
    })
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      )
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, AUTO_DISMISS_MS)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const contextValue = useCallback((): ToastContextValue => ({
    success: (msg: string) => addToast('success', msg),
    error:   (msg: string) => addToast('error', msg),
    warning: (msg: string) => addToast('warning', msg),
    info:    (msg: string) => addToast('info', msg),
  }), [addToast])

  const [value] = useState(contextValue)

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3
                shadow-lg min-w-[280px] max-w-[400px]
                ${typeStyles[toast.type]}
                ${toast.exiting ? 'animate-slide-out' : 'animate-slide-in'}
              `.trim()}
              role="alert"
            >
              <span className="text-lg font-bold">{typeIcons[toast.type]}</span>
              <span className="flex-1 text-sm">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 hover:opacity-70 font-bold text-lg leading-none"
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

export function ApiErrorListener() {
  const toast = useToast()

  const handlerRef = useRef<(e: Event) => void>()

  useEffect(() => {
    handlerRef.current = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message: string }
      if (detail?.message) {
        toast.error(detail.message)
      }
    }

    window.addEventListener('api-error', handlerRef.current)
    return () => {
      if (handlerRef.current) {
        window.removeEventListener('api-error', handlerRef.current)
      }
    }
  }, [toast])

  return null
}

/* ── Zustand-based toast store (for mutations outside React tree) ─── */
import { create as zustandCreate } from 'zustand'

export type { ToastType }

interface ZustandToast {
  id: number
  message: string
  type: ToastType
}

interface ToastStoreState {
  toasts: ZustandToast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: number) => void
}

let zustandNextId = 0

export const useToastStore = zustandCreate<ToastStoreState>((set) => ({
  toasts: [],
  addToast: (message: string, type: ToastType = 'success') => {
    const id = zustandNextId++
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  removeToast: (id: number) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

export function ZustandToastContainer() {
  const { toasts, removeToast } = useToastStore()

  const typeStylesMap: Record<ToastType, string> = {
    success: 'bg-brand-600 text-white',
    error:   'bg-red-600 text-white',
    warning: 'bg-amber-600 text-white',
    info:    'bg-blue-600 text-white',
  }

  const typeIconsMap: Record<ToastType, string> = {
    success: '\u2713',
    error:   '\u2717',
    warning: '\u26A0',
    info:    '\u2139',
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-white text-sm shadow-lg cursor-pointer ${typeStylesMap[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="font-bold">{typeIconsMap[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
