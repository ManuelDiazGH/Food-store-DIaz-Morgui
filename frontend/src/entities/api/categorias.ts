/** Categorias API — Types and HTTP functions for category endpoints. */
import { api } from '@entities/api/axios'

// ── Types ──────────────────────────────────────────────────────────

export interface CategoriaRead {
  id: number
  nombre: string
  descripcion: string | null
  padre_id: number | null
  created_at: string
  eliminado_en: string | null
}

export interface CategoriaTreeNode {
  id: number
  nombre: string
  descripcion: string | null
  padre_id: number | null
  subcategorias: CategoriaTreeNode[]
}

export interface CategoriaCreate {
  nombre: string
  descripcion?: string | null
  padre_id?: number | null
}

export interface CategoriaUpdate {
  nombre?: string
  descripcion?: string | null
  padre_id?: number | null
}

// ── API Functions ───────────────────────────────────────────────────

export async function getCategoryTree(): Promise<CategoriaTreeNode[]> {
  const { data } = await api.get<CategoriaTreeNode[]>('/api/v1/categorias/tree')
  return data
}

export async function getAllCategories(
  offset = 0,
  limit = 100,
): Promise<CategoriaRead[]> {
  const { data } = await api.get<CategoriaRead[]>('/api/v1/categorias', {
    params: { offset, limit },
  })
  return data
}

export async function getCategoryById(id: number): Promise<CategoriaRead> {
  const { data } = await api.get<CategoriaRead>(`/api/v1/categorias/${id}`)
  return data
}

export async function createCategory(payload: CategoriaCreate): Promise<CategoriaRead> {
  const { data } = await api.post<CategoriaRead>('/api/v1/categorias', payload)
  return data
}

export async function updateCategory(
  id: number,
  payload: CategoriaUpdate,
): Promise<CategoriaRead> {
  const { data } = await api.put<CategoriaRead>(`/api/v1/categorias/${id}`, payload)
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/api/v1/categorias/${id}`)
}