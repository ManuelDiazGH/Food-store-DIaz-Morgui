# Tasks: sprint7-order-visualization

## 1. Backend — Pedidos list endpoint with filters

- [x] 1.1 Agregar query params de filtro a `GET /api/v1/pedidos` (q, desde, hasta, estado, page, limit) en pedidos/router.py
- [x] 1.2 Agregar método de búsqueda en pedidos/repository.py — búsqueda por ID y nombre de cliente con ILIKE
- [x] 1.3 Modificar service para soportar filtros y paginación server-side
- [x] 1.4 Actualizar schema de respuesta para incluir paginación (items, total, page, limit)

## 2. Frontend — API hooks for filtered queries

- [x] 2.1 Agregar raw functions y hooks en `pedidosApi.ts` para búsqueda con filtros y paginación
- [x] 2.2 Agregar tipos `OrderFilters` y `PedidoListResponse` en types

## 3. Frontend — Enhanced OrdersPanelPage (US-051)

- [x] 3.1 Crear `widgets/pedidos/OrderSearchBar.tsx` — input de búsqueda + date range + select de estado
- [x] 3.2 Mejorar `pages/pedidos/OrdersPanelPage.tsx` — integrar search bar, paginación server-side, filtros en URL

## 4. Frontend — Gestor/Admin Order Detail (US-052)

- [x] 4.1 Crear `pages/pedidos/OrderDetailPanelPage.tsx` — detalle con datos del cliente, FSM transitions inline, historial
- [x] 4.2 Agregar ruta `/orders-panel/:id` en router bajo RoleGuard PEDIDOS/ADMIN
- [x] 4.3 Agregar constante `ORDERS_PANEL_DETAIL` en routes.ts

## 5. Verificación

- [x] 5.1 Backend: endpoints funcionan con filtros
- [x] 5.2 Frontend: `npm run build` exitoso ✅ (0 errores, 230 módulos)
