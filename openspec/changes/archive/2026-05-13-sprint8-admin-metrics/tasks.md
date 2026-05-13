# Tasks: sprint8-admin-metrics

## 1. Backend — Usuario activo field + endpoints

- [x] 1.1 Agregar campo `activo: bool = True` al modelo Usuario en all_models.py
- [x] 1.2 Generar migración Alembic
- [x] 1.3 Agregar endpoint PATCH /api/v1/usuarios/{id}/estado en usuarios/router.py
- [x] 1.4 Modificar login (auth/service.py) para rechazar si activo=False con 403
- [x] 1.5 Verificar que PUT /api/v1/usuarios/{id} permite ADMIN sin restricción de ownership

## 2. Backend — Dashboard metrics endpoints

- [x] 2.1 Agregar métodos al admin/service.py: get_metricas_resumen, get_ventas_por_periodo, get_top_productos, get_pedidos_por_estado
- [x] 2.2 Agregar schemas en admin/schemas.py: VentaPorPeriodo, TopProducto, PedidoPorEstado, MetricasCompletas
- [x] 2.3 Agregar endpoints en admin/router.py: GET /admin/metricas/completas, GET /admin/metricas/ventas, GET /admin/metricas/productos-top, GET /admin/metricas/pedidos-por-estado

## 3. Frontend — API hooks

- [x] 3.1 Crear hooks en entities/api/adminApi.ts: useDashboardMetrics, useVentasPorPeriodo, useTopProductos, usePedidosPorEstado, useToggleUserStatus, useUpdateUserData

## 4. Frontend — Enhanced AdminUsersPage (US-053, US-054, US-055)

- [x] 4.1 Agregar filtro por rol (select/checkboxes) en AdminUsersPage
- [x] 4.2 Agregar columna Estado (activo/inactivo) con toggle button
- [x] 4.3 Agregar modal de edición de usuario (nombre, email, telefono)
- [x] 4.4 Conectar a hooks useToggleUserStatus y useUpdateUserData

## 5. Frontend — AdminDashboard real (US-056, US-057, US-058, US-059)

- [x] 5.1 Crear metric cards reales (usuarios, pedidos, productos, ventas)
- [x] 5.2 Crear LineChart de ventas con selector de granularidad (día/semana/mes)
- [x] 5.3 Crear BarChart de top productos
- [x] 5.4 Crear PieChart de distribución de estados
- [x] 5.5 Conectar todo a hooks de adminApi

## 6. Verificación

- [x] 6.1 npm run build exitoso ✅ (0 errores, 1.84s)
