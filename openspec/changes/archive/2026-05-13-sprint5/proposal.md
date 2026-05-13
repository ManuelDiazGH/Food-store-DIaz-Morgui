## Why

Con el carrito de compras y las direcciones de entrega ya implementados (Sprint 4), Sprint 5 completa el flujo de compra: validaciones pre-checkout, creación atómica de pedidos con snapshots, y la experiencia de checkout en el frontend. Sin esto, los clientes pueden armar su carrito pero no pueden concretar la compra.

El backend de pedidos ya tiene implementado el CRUD base, la FSM, la validación de stock y los snapshots de precio. Sprint 5 agrega las piezas faltantes: snapshots de dirección, endpoint de validación pre-checkout, y el frontend completo de checkout y visualización de pedidos.

## What Changes

### EPIC 09 — Validaciones Pre-Checkout (US-069, US-070)
- **Backend**: Agregar endpoint `POST /api/pedidos/validar` que verifica:
  - Disponibilidad de cada producto (stock suficiente)
  - Que ningún producto haya sido desactivado/eliminado
  - Cambios de precio desde que se agregó al carrito (US-070)
- **Backend**: `GET /api/pedidos/{id}/historial` endpoint para auditoría (US-044)

### EPIC 10 — Creación de Pedidos (US-035 a US-038)
- **Backend**: Agregar campos de snapshot de dirección en modelo `Pedido`:
  - `direccion_snapshot_alias`, `direccion_snapshot_linea1`, `direccion_snapshot_linea2`, `direccion_snapshot_ciudad`, `direccion_snapshot_cp` (US-038)
- **Backend**: Actualizar `PedidoService.create()` para capturar snapshot de dirección desde `DireccionEntrega` (US-038)
- **Backend**: Descontar stock atómicamente en la confirmación del pedido (ya existe en create, reforzar)
- **Frontend**: Crear `entities/api/pedidosApi.ts` con hooks TanStack Query
- **Frontend**: Crear páginas de checkout:
  - Selección de dirección de entrega
  - Resumen del carrito + validación pre-checkout
  - Confirmación de pedido creado (US-071)
- **Frontend**: Crear página de detalle de pedido (`/orders/:id`)
- **Frontend**: Habilitar botón "Proceder al checkout" en CartPage

### EPIC 13 — Visualización de Pedidos (US-049, US-050)
- **Frontend**: Implementar página `/orders` con listado de pedidos del cliente
- **Frontend**: Implementar página `/orders/:id` con detalle completo (items snapshots, historial estados, pago)

## Capabilities

### New Capabilities
- `pre-checkout-validation`: Validación de disponibilidad y precios antes de crear un pedido — endpoint backend + integración frontend
- `checkout-frontend`: Flujo de checkout completo — selección de dirección, resumen, confirmación de pedido, pantalla de éxito
- `order-history-frontend`: Visualización de pedidos del cliente — listado paginado con filtros y detalle completo con historial de estados
- `order-creation-backend`: Snapshots de dirección en pedidos — modelo, migración y lógica de creación

### Modified Capabilities
- `shopping-cart-frontend`: Habilitar botón "Proceder al checkout" (antes deshabilitado) y conectar al flujo de checkout; vaciar carrito al crear pedido exitosamente

## Impact

- **Backend model**: `Pedido` tabla — nuevos campos de snapshot de dirección (migración Alembic)
- **Backend new endpoints**: `POST /api/pedidos/validar`, `GET /api/pedidos/{id}/historial`
- **Backend modified**: `PedidoService.create()` — agregar snapshot de dirección
- **Frontend new**: `entities/api/pedidosApi.ts`, `pages/CheckoutPage.tsx`, `pages/OrderDetailPage.tsx`, `pages/OrdersPage.tsx`
- **Frontend modified**: `pages/CartPage.tsx` — habilitar checkout button
- **Dependencias**: Sprint 4 (carrito + direcciones) debe estar completo
