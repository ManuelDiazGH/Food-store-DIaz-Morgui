import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ── localStorage polyfill for vitest 4.x + jsdom 29 ─────────────────
// Vitest 4.x rompe localStorage.setItem en jsdom. Reemplazamos con
// un Storage en memoria para que Zustand persist funcione en tests.
const lsStore = new Map<string, string>()
const mockStorage: Storage = {
  setItem: (key: string, value: string) => { lsStore.set(key, String(value)) },
  getItem: (key: string) => lsStore.get(key) ?? null,
  removeItem: (key: string) => { lsStore.delete(key) },
  clear: () => { lsStore.clear() },
  key: (index: number) => Array.from(lsStore.keys())[index] ?? null,
  get length() { return lsStore.size },
} as Storage

vi.stubGlobal('localStorage', mockStorage)
