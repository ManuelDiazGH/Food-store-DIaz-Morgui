/** Toast notification system — Zustand store + React component. */
import { create } from 'zustand'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: number) => void
}

let nextId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message: string, type: ToastType = 'success') => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },

  removeToast: (id: number) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

/** Hook that provides addToast with defaults. */
export function useToast() {
  const { addToast } = useToastStore()
  return {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
  }
}

/** Toast container — render once at app root. */
export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  const typeStyles: Record<ToastType, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-500',
  }

  const typeIcons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-white text-sm shadow-lg animate-slide-in ${typeStyles[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="font-bold">{typeIcons[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

/** Hook that auto-dismisses toasts. Used internally. */
export function useAutoDismissToast(id: number) {
  const removeToast = useToastStore((s) => s.removeToast)
  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 3000)
    return () => clearTimeout(timer)
  }, [id, removeToast])
}