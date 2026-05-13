/** TanStack Query hooks for stock product management. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProductosStock,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  associateProductoCategorias,
  associateProductoIngredientes,
  updateProductoStock,
  type ProductFilters,
  type ProductoStockItem,
} from '@entities/api/productosApi'
import type { ProductoCreate, ProductoUpdate, ProductoDetalleRead, StockUpdate } from '@entities/types'
import { useToast } from '@shared/ui/Toast'
import { getErrorMessage } from '@shared/utils/errorHandler'

export const productKeys = {
  all: ['productos'] as const,
  stock: (params?: ProductFilters) => ['productos', 'stock', params] as const,
  detail: (id: number) => ['productos', 'detail', id] as const,
}

export function useProducts(params?: ProductFilters) {
  return useQuery<ProductoStockItem[]>({
    queryKey: productKeys.stock(params),
    queryFn: async () => {
      const res = await getProductosStock(params)
      return res.items
    },
  })
}

export function useProductsPaginated(params?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.stock(params),
    queryFn: () => getProductosStock(params),
  })
}

export function useProduct(id: number) {
  return useQuery<ProductoDetalleRead>({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductoById(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (data: ProductoCreate) => createProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Producto creado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      updateProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Producto actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Producto eliminado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useAssociateCategorias() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, categoria_ids }: { id: number; categoria_ids: number[] }) =>
      associateProductoCategorias(id, categoria_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Categorías actualizadas exitosamente')
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useAssociateIngredientes() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, ingredientes }: { id: number; ingredientes: Array<{ ingrediente_id: number; es_removible: boolean }> }) =>
      associateProductoIngredientes(id, ingredientes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Ingredientes actualizados exitosamente')
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateStock() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockUpdate }) =>
      updateProductoStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Stock actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
