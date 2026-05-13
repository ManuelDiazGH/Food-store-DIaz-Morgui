# Design: sprint8-admin-metrics

## Architecture Overview

Completar la funcionalidad administrativa del sistema: gestión de usuarios, dashboard con métricas reales y charts.

## EPIC 15 — Admin Usuarios

### Backend
1. Agregar campo `activo: bool = True` al modelo `Usuario` + migración Alembic
2. Endpoint `PATCH /api/v1/usuarios/{id}/estado` — toggle activo/inactivo (ADMIN only)
3. Modificar login para rechazar usuarios con `activo=False` (403 "Cuenta desactivada")
4. Endpoint `PUT /api/v1/usuarios/{id}` ya existe (update_usuario) — verificar que ADMIN pueda editar cualquier campo

### Frontend — AdminUsersPage
- Agregar filtro por rol (select con checkbox o pills)
- Agregar columna "Estado" (Activo/Inactivo) con toggle
- Agregar botón "Editar" que abre modal con formulario de datos
- Migrar a server-side pagination

## EPIC 17 — Dashboard y Métricas

### Backend — Admin service
Agregar métodos:
- `get_metricas_resumen(uow)` — total usuarios, pedidos, productos, ventas totales
- `get_ventas_por_periodo(uow, desde, hasta, granularidad)` — ventas agrupadas por día/semana/mes
- `get_top_productos(uow, top, desde, hasta)` — ranking de más vendidos
- `get_pedidos_por_estado(uow, desde, hasta)` — distribución por estado

### Frontend — AdminDashboardPage
Cards con métricas (usuarios, pedidos, productos, ventas) + charts:
- LineChart de ventas (Recharts) con selector de granularidad
- BarChart de top productos
- PieChart de distribución de estados

### Data Types
```typescript
interface DashboardMetrics {
  total_usuarios: number
  total_pedidos: number
  total_productos: number
  total_ventas: number
}
interface VentaPorPeriodo { periodo: string; monto: number; cantidad: number }
interface TopProducto { nombre: string; cantidad: number; ingreso: number }
interface PedidoPorEstado { estado: string; cantidad: number }
```
