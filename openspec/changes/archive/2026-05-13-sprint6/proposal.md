## Why

Sprint 6 completa el ciclo de vida del pedido en dos frentes: permite a los clientes pagar sus pedidos con MercadoPago (EPIC 11) y habilita al rol PEDIDOS a gestionar el flujo de preparación y entrega mediante la máquina de estados (EPIC 12). Sin esto, los pedidos quedan atrapados en PENDIENTE sin forma de avanzar.

El backend de pagos ya tiene la estructura base (modelo, repository, router, webhook) y el SDK de MercadoPago está instalado en ambos lados, pero la integración real con la API de MP para crear preferencias de pago NO está implementada. La FSM de pedidos backend ya funciona completamente; falta el frontend de gestión para operadores.

## What Changes

### EPIC 11 — Pagos con MercadoPago (US-045 a US-048)
- **Backend**: Conectar `PagoService.crear_pago()` con el SDK `mercadopago` para crear una preferencia/orden de pago real en la API de MercadoPago y devolver el init_point (link de pago) al frontend
- **Backend**: Mejorar `POST /api/pagos/crear` para que reciba información de la forma de pago y devuelva la URL de redirección
- **Backend**: Mejorar webhook IPN para mapear correctamente los estados de MP (approved → CONFIRMADO en pedido, rejected → mantener PENDIENTE)
- **Frontend**: Integrar pago en el flujo de checkout — después de crear el pedido, mostrar botón "Pagar con MercadoPago" que redirige al checkout de MP
- **Frontend**: Manejar callbacks de retorno de MP (success, failure, pending) y mostrar resultado al cliente (US-072)
- **Frontend**: Mostrar estado de pago en detalle de pedido (US-047)
- **Frontend**: Botón "Reintentar pago" en pedidos con pago rechazado (US-048)

### EPIC 12 — FSM de Pedidos Frontend (US-039 a US-044)
- **Frontend**: Implementar `pages/pedidos/OrdersPanelPage.tsx` con listado de pedidos para rol PEDIDOS
- **Frontend**: Botones de transición de estado según FSM: CONFIRMAR, EN_PREPARACION, EN_CAMINO, ENTREGAR, CANCELAR (con motivo)
- **Frontend**: Modal de confirmación para cada transición con campos adicionales (motivo para cancelación)
- **Frontend**: Auto-refresh de la lista de pedidos para ver cambios en tiempo real

### Rompe el flujo de checkout actual
- **checkout-frontend**: Actualizar `CheckoutPage.tsx` para crear el pago automáticamente después del pedido y redirigir a MP
- **order-history-frontend**: Agregar estado de pago y botón de reintento en `OrderDetailPage.tsx`

## Capabilities

### New Capabilities
- `payment-integration`: Integración real con MercadoPago Orders API — creación de preferencias de pago, webhook IPN, callback de retorno, reintento de pago
- `order-management-frontend`: Panel de gestión de pedidos para rol PEDIDOS/ADMIN — listado con filtros, botones de transición de estado FSM, modal de confirmación y cancelación

### Modified Capabilities
- `checkout-frontend`: Agregar paso de pago con MercadoPago después de crear el pedido — redirigir a MP y manejar retorno
- `order-history-frontend`: Agregar estado de pago en detalle de pedido + botón de reintento para pagos rechazados

## Impact

- **Backend new**: `PagoService.crear_pago()` — integración real con SDK mercadopago (crear preferencia/orden)
- **Backend modified**: Webhook IPN — mapeo de estados MP a estados de pedido (approved → CONFIRMADO)
- **Frontend new**: `features/pedidos/` con componentes de gestión de estados
- **Frontend new**: `pages/pedidos/OrdersPanelPage.tsx` (reemplazar placeholder)
- **Frontend modified**: `pages/CheckoutPage.tsx` — agregar flujo de pago post-creación
- **Frontend modified**: `pages/OrderDetailPage.tsx` — mostrar estado de pago + reintento
- **Frontend modified**: `entities/api/pedidosApi.ts` — agregar hooks de pago
- **Config**: Variables de entorno para credenciales de MercadoPago (ACCESS_TOKEN, PUBLIC_KEY)
