## 1. Backend — Address Snapshot Fields + Migration

- [x] 1.1 Add address snapshot fields to `Pedido` model in `all_models.py`: `direccion_snapshot_alias`, `direccion_snapshot_linea1`, `direccion_snapshot_linea2`, `direccion_snapshot_ciudad`, `direccion_snapshot_cp`
- [x] 1.2 Generate Alembic migration for new Pedido columns
- [x] 1.3 Update `PedidoService.create()` to fetch `DireccionEntrega` and populate snapshot fields on order creation

## 2. Backend — Validation Endpoint + History Endpoint

- [x] 2.1 Add validation schemas: `ValidarItemsRequest`, `ValidarItemsResponse`, `ItemValidado` in `pedidos/schemas.py`
- [x] 2.2 Implement `PedidoService.validar_items()` — validate stock, availability, price comparison
- [x] 2.3 Add `POST /api/pedidos/validar` endpoint in `pedidos/router.py`
- [x] 2.4 Add `GET /api/pedidos/{id}/historial` endpoint returning `list[HistorialEstadoRead]`

## 3. Frontend — Pedidos API Layer

- [x] 3.1 Create `entities/api/pedidosApi.ts` with TanStack Query hooks: `usePedidos`, `usePedidoDetalle`, `useHistorialPedido`, `useCreatePedido`, `useValidarPedido`
- [x] 3.2 Configure query keys and invalidations

## 4. Frontend — Checkout Page

- [x] 4.1 Create `pages/CheckoutPage.tsx` with sections: cart summary (read-only), address selection (radio list from `useDirecciones()`), payment method (hardcoded: "Efectivo" for now)
- [x] 4.2 Implement "Crear pedido" button that calls `useCreatePedido`, clears cart via `useCartStore.clearCart()` on success, redirects to `/orders/{id}`
- [x] 4.3 Handle errors: stock issues, price changes, network errors — display inline and keep cart intact
- [x] 4.4 Register `/checkout` route in `router.tsx` under `ProtectedRoute`
- [x] 4.5 Enable "Proceder al checkout" button in `CartPage.tsx` — navigate to `/checkout`

## 5. Frontend — Order List Page

- [x] 5.1 Implement `pages/OrdersPage.tsx` — list pedidos from `GET /api/v1/pedidos?usuario_id={id}`, show order number, date, status badge, total
- [x] 5.2 Add status filter buttons (PENDIENTE, CONFIRMADO, etc.) and pagination
- [x] 5.3 Add empty state: "No tenés pedidos aún" with link to catalog
- [x] 5.4 Each order row links to `/orders/{id}` for detail

## 6. Frontend — Order Detail Page

- [x] 6.1 Create `pages/OrderDetailPage.tsx` — fetch order by ID, display: items (name, quantity, price snapshot, exclusions), delivery address snapshot, current status badge, total
- [x] 6.2 Add status history timeline from `GET /api/pedidos/{id}/historial` — show each transition with date, previous → new state, actor
- [x] 6.3 Handle 404 and 403 errors gracefully
- [x] 6.4 Add "Volver a mis pedidos" link

## 7. Cleanup & Verification

- [x] 7.1 Verify CartPage empty state still works after enabling checkout button
- [x] 7.2 Verify cart clears on successful order creation (via `useCreatePedido.onSuccess`)
- [x] 7.3 Verify address snapshot is immutable after creation (stored in dedicated columns, not FK)
- [x] 7.4 Run Alembic migration and verify new columns
