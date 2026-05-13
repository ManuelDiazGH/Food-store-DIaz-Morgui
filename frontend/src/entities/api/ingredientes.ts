/** Ingredientes API — Types and HTTP functions for ingredient endpoints. */
import { api } from '@entities/api/axios'

// ── Types ──────────────────────────────────────────────────────────

export interface IngredienteRead {
  id: number
  nombre: string
  es_alergeno: boolean
  eliminado_en: string | null
  created_at: string
}

export interface IngredienteCreate {
  nombre: string
  es_alergeno: boolean
}

export interface IngredienteUpdate {
  nombre?: string
  es_alergeno?: boolean
}

// ── API Functions ───────────────────────────────────────────────────

export async function getAllIngredients(
  params?: { alergeno?: boolean; offset?: number; limit?: number },
): Promise<IngredienteRead[]> {
  const { data } = await api.get<IngredienteRead[]>('/api/v1/ingredientes', {
    params: {
      alergeno: params?.alergeno,
      offset: params?.offset ?? 0,
      limit: params?.limit ?? 100,
    },
  })
  return data
}

export async function getIngredientById(id: number): Promise<IngredienteRead> {
  const { data } = await api.get<IngredienteRead>(`/api/v1/ingredientes/${id}`)
  return data
}

export async function createIngredient(
  payload: IngredienteCreate,
): Promise<IngredienteRead> {
  const { data } = await api.post<IngredienteRead>('/api/v1/ingredientes', payload)
  return data
}

export async function updateIngredient(
  id: number,
  payload: IngredienteUpdate,
): Promise<IngredienteRead> {
  const { data } = await api.put<IngredienteRead>(
    `/api/v1/ingredientes/${id}`,
    payload,
  )
  return data
}

export async function deleteIngredient(id: number): Promise<void> {
  await api.delete(`/api/v1/ingredientes/${id}`)
}