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
  activo?: boolean
  created_at: string
  eliminado_en?: string
}

// ── Admin Dashboard ────────────────────────────────────────────
export interface VentaPorPeriodo {
  periodo: string
  monto: number
  cantidad: number
}

export interface TopProducto {
  nombre: string
  cantidad_vendida: number
  ingreso_total: number
}

export interface PedidoPorEstado {
  estado: string
  cantidad: number
}

export interface MetricasCompletas {
  total_usuarios: number
  total_pedidos: number
  total_productos: number
  total_ventas: number
  ventas_por_periodo: VentaPorPeriodo[]
  top_productos: TopProducto[]
  pedidos_por_estado: PedidoPorEstado[]
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
  created_at: string
  eliminado_en?: string
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
  nombre?: string
}

// ── Producto DTOs (Sprint 3) ──────────────────────────────────────
export interface ProductoCatalogoRead {
  id: number
  nombre: string
  precio_base: number
  imagen?: string
  disponible: boolean
  hay_stock?: boolean
  /** Solo presente en vistas de admin/stock (incluir_eliminados=true). */
  stock_cantidad?: number
  eliminado_en?: string
  categorias: string[]
}

export interface ProductoCategoriaRead {
  id: number
  nombre: string
  es_principal: boolean
}

export interface ProductoIngredienteRead {
  id: number
  nombre: string
  es_alergeno: boolean
  es_removible: boolean
}

export interface ProductoDetalleRead {
  id: number
  nombre: string
  descripcion?: string
  precio_base: number
  imagen?: string
  disponible: boolean
  hay_stock: boolean
  /** Solo presente cuando el solicitante tiene rol ADMIN o STOCK. */
  stock_cantidad?: number
  categorias: ProductoCategoriaRead[]
  ingredientes: ProductoIngredienteRead[]
}

export interface ProductoListResponse {
  items: ProductoCatalogoRead[]
  total: number
  page: number
  limit: number
}

export interface ProductoCreate {
  nombre: string
  descripcion?: string
  precio_base: number
  stock_cantidad: number
  disponible?: boolean
  imagen?: string
}

export interface ProductoUpdate {
  nombre?: string
  descripcion?: string
  precio_base?: number
  stock_cantidad?: number
  disponible?: boolean
  imagen?: string
}

export interface StockUpdate {
  cantidad: number
  tipo: 'incremento' | 'absoluto'
}

// ── Perfil (Sprint 3) ──────────────────────────────────────────
export interface PerfilRead {
  id: number
  nombre: string
  email: string
  telefono?: string
  fecha_registro: string
}

export interface PerfilUpdate {
  nombre: string
  telefono?: string
}

export interface PasswordChange {
  password_actual: string
  password_nueva: string
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
  usuario?: { id: number; nombre: string; email: string; telefono?: string }
  estado_codigo: EstadoPedidoCodigo
  total: number
  costo_envio: number
  forma_pago_codigo: string
  direccion_id?: number
  notas?: string
  created_at: string
  detalles?: DetallePedido[]
  historial?: HistorialEstadoPedido[]
  pagos?: { id: number; mp_status: string; updated_at?: string }[]
  // Snapshot fields (set at order creation)
  direccion_snapshot_alias?: string
  direccion_snapshot_linea1?: string
  direccion_snapshot_linea2?: string
  direccion_snapshot_ciudad?: string
  direccion_snapshot_cp?: string
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
  mp_payment_id?: string
  mp_status: string
  external_reference: string
  idempotency_key: string
  created_at: string
}

export interface FormaPago {
  codigo: string
  nombre: string
  habilitado: boolean
}

// ── Rol ─────────────────────────────────────────────────────────
// ── Paginated response (Sprint 7) ───────────────────────────────
export interface PedidoListResponse {
  items: Pedido[]
  total: number
  page: number
  limit: number
}

export type RolCodigo = 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT'