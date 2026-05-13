## Context

Sprint 5 completa el flujo de compra. El backend de pedidos ya tiene implementado:

**Backend existente (✅ ya funciona):**
- Modelos: `Pedido`, `DetallePedido`, `HistorialEstadoPedido`, `EstadoPedido`, `Pago`
- `PedidoService.create()` — valida stock, crea snapshots de precio, audit trail, Unit of Work
- `PedidoService.transicionar_estado()` — FSM completa con 6 estados y transiciones validadas
- CRUD endpoints: `GET /api/v1/pedidos`, `GET /api/v1/pedidos/{id}`, `POST /api/v1/pedidos`, `PATCH /api/v1/pedidos/{id}/estado`
- Módulo `pagos/` con estructura de MercadoPago (service, repository, router)

**Lo que falta para Sprint 5:**
- Snapshots de dirección en `Pedido` (US-038) — el modelo solo tiene `direccion_id` FK
- Endpoint `POST /api/pedidos/validar` para validaciones pre-checkout (US-069, US-070)
- Endpoint `GET /api/pedidos/{id}/historial` para auditoría (US-044)
- Frontend checkout flow completo (selección de dirección, validación, confirmación)
- Frontend de visualización de pedidos (listado + detalle)

## Goals / Non-Goals

**Goals:**
- Agregar campos de snapshot de dirección al modelo `Pedido` + migración Alembic
- Implementar endpoint de validación pre-checkout (stock + precios)
- Implementar endpoint de historial de estados
- Construir frontend de checkout: seleccionar dirección → validar → crear pedido → confirmación
- Construir frontend de pedidos: listado (`/orders`) y detalle (`/orders/:id`)
- Habilitar botón "Proceder al checkout" en CartPage
- Vaciar carrito al crear pedido exitosamente

**Non-Goals:**
- NO se implementa pago con MercadoPago (Sprint 6 — EPIC 11)
- NO se implementa la FSM de cancelación de pedidos (backend ya existe, frontend en Sprint 6)
- NO se implementa panel de Gestor de Pedidos (Sprint 7 — EPIC 13)
- NO se implementa admin dashboard (Sprint 8)

## Decisions

### 1. Address snapshot: columnas separadas vs JSON

**Decisión**: Columnas separadas en la tabla `Pedido`.

El modelo `Pedido` ya tiene `direccion_id` (FK). Se agregan campos:
- `direccion_snapshot_alias: Optional[str]`
- `direccion_snapshot_linea1: str`
- `direccion_snapshot_linea2: Optional[str]`
- `direccion_snapshot_ciudad: str`
- `direccion_snapshot_cp: str`

**Alternativa considerada**: JSON en un solo campo `direccion_snapshot JSONB`.
**Razón**: Columnas separadas son más fáciles de consultar, migrar y mantener. Además el modelo ya usa columnas tipadas. El `create()` copiará los datos de `DireccionEntrega` al snapshot en la transacción.

### 2. Endpoint de validación: `POST /api/pedidos/validar`

**Decisión**: Endpoint separado, no parte del `create`.

Recibe el mismo body que `CrearPedidoRequest` (o un subset similar) y retorna:
```json
{
  "valido": true/false,
  "items_validados": [{ "producto_id": 1, "disponible": true, "stock_suficiente": true, "precio_actual": 10.50, "precio_original": 10.00, "hubo_cambio_precio": true }],
  "errores": ["Producto 'X' sin stock suficiente"]
}
```

**Alternativa considerada**: Validar dentro del `create` con errores genéricos.
**Razón**: Endpoint separado permite al frontend validar antes de mostrar la pantalla de confirmación, dando feedback temprano al cliente. El `create` igual valida dentro de la transacción como seguridad.

### 3. Frontend checkout flow

**Decisión**: Página única (`/checkout`) con 3 pasos en una columna:
1. **Resumen del carrito** (read-only, mostrar items del Zustand store)
2. **Seleccionar dirección** (dropdown de direcciones del usuario vía `useDirecciones()`)
3. **Confirmar pedido** (botón "Crear pedido" → `POST /api/pedidos`)

Post-creación: redirigir a `/orders/{id}` con mensaje de éxito (US-071).

**Alternativa considerada**: Multi-step wizard con tabs. Descartado por simplicidad — 3 secciones verticales en una página es suficiente.

### 4. Frontend de pedidos: listado + detalle

**Decisión**: Ruta `/orders` para listado, `/orders/:id` para detalle.

- `/orders` → `OrdersPage` (reemplazar placeholder) con lista paginada desde `GET /api/v1/pedidos?usuario_id={id}`
- `/orders/:id` → `OrderDetailPage` (nueva) con items snapshot, historial de estados, estado de pago
- Hooks TanStack Query en `entities/api/pedidosApi.ts`

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **El endpoint GET /api/v1/pedidos no está protegido** — cualquiera puede listar pedidos de cualquier usuario pasando `?usuario_id=` | El frontend siempre filtra por el usuario autenticado. Se agregará protección en backend en Sprint 8 |
| **Snapshot de dirección duplica datos** — cambios posteriores no se reflejan en pedidos existentes | Es intencional (RN-PE03). Los snapshots son inmutables una vez creado el pedido |
| **Validación y creación no son atómicas** — podría pasar que entre validar y crear cambie el stock | El `create()` vuelve a validar TODO dentro de la transacción con `SELECT FOR UPDATE`. La validación pre-checkout es solo informativa |
