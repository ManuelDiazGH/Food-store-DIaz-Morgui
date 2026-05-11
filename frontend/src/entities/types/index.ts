/** Domain types matching backend Pydantic schemas. */

// ── Auth ────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  email: string
  password: string
  telefono?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface UserResponse {
  id: number
  email: string
  nombre: string
  telefono?: string
  roles: string[]
  created_at: string
}

// ── Usuario ────────────────────────────────────────────────────
export interface Usuario {
  id: number
  email: string
  nombre: string
  telefono?: string
  roles: string[]
  created_at: string
  eliminado_en?: string
}

// ── Categoria ──────────────────────────────────────────────────
export interface Categoria {
  id: number
  nombre: string
  descripcion?: string
  padre_id?: number
  eliminado_en?: string
}

// ── Producto ───────────────────────────────────────────────────
export interface Producto {
  id: number
  nombre: string
  descripcion?: string
  precio_base: number
  stock_cantidad: number
  disponible: boolean
  imagen?: string
  categorias?: ProductoCategoria[]
  ingredientes?: ProductoIngrediente[]
}

export interface ProductoCategoria {
  producto_id: number
  categoria_id: number
  es_principal: boolean
}

export interface ProductoIngrediente {
  producto_id: number
  ingrediente_id: number
  es_removible: boolean
}

// ── Ingrediente ────────────────────────────────────────────────
export interface Ingrediente {
  id: number
  nombre: string
  es_alergeno: boolean
}

// ── Pedido ─────────────────────────────────────────────────────
export type EstadoPedidoCodigo =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'

export interface Pedido {
  id: number
  usuario_id: number
  estado_codigo: EstadoPedidoCodigo
  total: number
  costo_envio: number
  forma_pago_codigo: string
  direccion_id?: number
  notas?: string
  created_at: string
  detalles?: DetallePedido[]
  historial?: HistorialEstadoPedido[]
}

export interface DetallePedido {
  id: number
  pedido_id: number
  producto_id: number
  nombre_snapshot: string
  precio_snapshot: number
  cantidad: number
  personalizacion?: number[]
}

export interface HistorialEstadoPedido {
  id: number
  pedido_id: number
  estado_desde?: string
  estado_hasta: string
  created_at: string
  usuario_id?: number
  observacion?: string
  motivo?: string
}

// ── DireccionEntrega ───────────────────────────────────────────
export interface DireccionEntrega {
  id: number
  alias?: string
  linea1: string
  linea2?: string
  ciudad: string
  cp: string
  es_principal: boolean
  usuario_id: number
}

// ── Pago ───────────────────────────────────────────────────────
export interface Pago {
  id: number
  pedido_id: number
  mp_payment_id?: number
  mp_status: string
  external_reference: string
  idempotency_key: string
}

export interface FormaPago {
  codigo: string
  nombre: string
  habilitado: boolean
}

// ── Rol ─────────────────────────────────────────────────────────
export type RolCodigo = 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT'