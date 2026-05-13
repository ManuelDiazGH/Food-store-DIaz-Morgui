## Context

Sprint 6 completa dos EPICs críticas: pagos con MercadoPago y gestión de pedidos vía FSM.

**Estado actual del backend de pagos:**
- Módulo `pagos/` con schemas, repository, service, router ✅
- `POST /api/pagos/crear` — endpoint activo pero sin integración real con MP SDK ✅/❌
- `POST /api/pagos/webhook` — endpoint IPN activo pero sin mapeo a estados de pedido ✅/❌
- `GET /api/pagos/pedido/{pedido_id}` — consulta de pagos ✅
- SDK `mercadopago>=2.3.0` en requirements.txt pero SIN USO en service.py ❌
- Variables de entorno `MP_ACCESS_TOKEN` y `MP_PUBLIC_KEY` configuradas ✅

**Estado actual de la FSM frontend:**
- Backend: FSM con 6 estados, transiciones validadas, endpoints PATCH ✅
- Frontend: `OrdersPanelPage` es un placeholder vacío ❌
- Frontend: `features/pedidos/` no existe ❌
- Ruta `/orders-panel` ya registrada con RoleGuard para PEDIDOS/ADMIN ✅

## Goals / Non-Goals

**Goals:**
- Integrar MercadoPago SDK en `PagoService.crear_pago()` para crear preferencias de pago reales y devolver init_point
- Mejorar webhook IPN para mapear `approved` → transicionar pedido a CONFIRMADO + descontar stock
- Agregar flujo de pago post-creación en CheckoutPage (redirigir a MP)
- Manejar callbacks de retorno de MP (success → mostrar confirmación, failure → mostrar error + reintento)
- Mostrar estado de pago en OrderDetailPage
- Implementar OrdersPanelPage con listado de pedidos y botones de transición FSM
- Agregar reintento de pago en pedidos con pago rechazado

**Non-Goals:**
- NO se implementa suscripciones ni pagos recurrentes
- NO se implementa la opción "pago en efectivo" (solo MP por ahora)
- NO se implementa dashboard de métricas (Sprint 8)
- NO se implementa configuración del sistema (Sprint 8)

## Decisions

### 1. Integración MP: Orders API vía SDK

**Decisión**: Usar `mercadopago` SDK Python con `MP. Payment` para crear preferencias.

El `POST /api/pagos/crear` se modifica para:
1. Crear el pago localmente (como hoy)
2. Llamar a `sdk.payment().create()` con los datos del pedido
3. Almacenar `mp_payment_id` devuelto por MP en el registro de pago
4. Devolver `init_point` (URL de checkout de MP) al frontend

**Alternativa considerada**: Llamar directamente a la REST API de MP sin SDK. Descartado porque el SDK ya está instalado, maneja autenticación y firma, y es más mantenible.

### 2. Webhook: mapeo de estados MP → Pedido

**Decisión**: El webhook no solo actualiza `mp_status` del pago, sino que también dispara la transición de estado del pedido usando `PedidoService.transicionar_estado()`.

| mp_status | Acción |
|---|---|
| `approved` | Pago → APPROVED, Pedido → CONFIRMADO (descontar stock atómicamente) |
| `rejected` | Pago → REJECTED, Pedido queda PENDIENTE |
| `pending` / `in_process` | Pago → IN_PROCESS, Pedido sigue PENDIENTE |
| `cancelled` | Pago → CANCELLED, Pedido puede ser cancelado |

El webhook es idempotente: si ya procesó ese `mp_payment_id`, no vuelve a transicionar.

### 3. Frontend: flujo de pago post-checkout

**Decisión**: Modificar `CheckoutPage.tsx` para que después de crear el pedido exitosamente:
1. Llame `POST /api/pagos/crear` con `{ pedido_id, forma_pago_codigo }`
2. Si MP devuelve `init_point`, redirigir al browser a esa URL
3. El callback de MP (success_url) apunta a `/orders/{id}` con mensaje de éxito
4. El callback failure_url apunta a `/orders/{id}` con mensaje de error y botón de reintento

**Alternativa considerada**: Usar `@mercadopago/sdk-react` con checkout embebido (Brick). Descartado para MVP porque el redirect checkout es más simple, no requiere tokenización en frontend, y ya es compatible con PCI SAQ-A. Se puede migrar a Brick en una iteración futura.

### 4. OrdersPanelPage: estructura

**Decisión**: Feature-FSD con componentes reutilizables:

```
features/pedidos/
├── components/
│   ├── OrderTable.tsx        ← Tabla de pedidos con filtros
│   ├── StateTransitionButton.tsx  ← Botón de transición contextual
│   └── TransitionModal.tsx   ← Modal de confirmación + motivo
├── hooks/
│   └── useOrderActions.ts    ← Mutaciones de transición de estado
└── index.ts
```

La página usa `GET /api/v1/pedidos` (sin filtro de usuario) para obtener TODOS los pedidos.
Los botones de acción se muestran según el estado actual y las transiciones válidas de la FSM.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **MP Access Token expuesto** — si se configura mal, cualquiera podría crear pagos | El token se carga desde variables de entorno, nunca se expone al frontend. Solo se usa server-side en `PagoService` |
| **Webhook no autenticado** — cualquiera podría enviar notificaciones falsas | Verificar firma del header `X-Signature` de MP. Documentado pero no bloqueante para MVP |
| **El redirect a MP pierde contexto de sesión** — el usuario vuelve y no ve su pedido | Usar `external_reference` como identificador en la URL de callback para cargar el pedido automáticamente |
| **Transición de estado concurrente** — dos webhooks del mismo pago podrían ejecutarse en paralelo | El webhook es síncrono y la FSM valida la transición. Si ya está CONFIRMADO, rechaza CONFIRMADO → CONFIRMADO |
