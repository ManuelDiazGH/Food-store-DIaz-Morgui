## 1. Backend — Payment Integration with MercadoPago SDK

- [x] 1.1 Create `backend/app/core/mp.py` — MercadoPago SDK client singleton using `MP_ACCESS_TOKEN` from settings
- [x] 1.2 Update `PagoService.crear_pago()` to call `sdk.payment().create()` with pedido data (items, total, external_reference) and store mp_payment_id
- [x] 1.3 Update `POST /api/pagos/crear` response to include `init_point` (MP checkout URL) for frontend redirect
- [x] 1.4 Update `PagoService.process_webhook()` to map `approved` → transicionar pedido a CONFIRMADO via `PedidoService.transicionar_estado()`
- [x] 1.5 Add idempotency check in webhook to prevent duplicate state transitions
- [x] 1.6 Update `GET /api/pagos/pedido/{pedido_id}` to return latest payment status with human-readable state

## 2. Frontend — Payment API Layer

- [x] 2.1 Add `useIniciarPago()` mutation hook in `pedidosApi.ts` — calls `POST /api/pagos/crear`
- [x] 2.2 Add `usePagoByPedido()` query hook — calls `GET /api/pagos/pedido/{pedido_id}`
- [x] 2.3 Add `useReintentarPago()` mutation hook — calls `POST /api/pagos/crear` (same endpoint, new idempotency key)
- [x] 2.4 Configure query keys for pagos

## 3. Frontend — Payment Flow in Checkout

- [x] 3.1 Update `CheckoutPage.tsx` — after successful order creation, call `useIniciarPago()` and redirect to MP init_point
- [x] 3.2 Handle cases where MP returns error — show error message, keep pedido intact
- [x] 3.3 Handle MP callbacks: parse `status` from URL params on `/orders/{id}` to show success/error/pending feedback

## 4. Frontend — Payment Status in Order Detail

- [x] 4.1 Add payment status section to `OrderDetailPage.tsx` — query `usePagoByPedido()` and display MP status badge
- [x] 4.2 Add "Reintentar pago" button for rejected payments
- [x] 4.3 Handle retry flow: call `useReintentarPago()` and redirect to MP

## 5. Frontend — Order Management Panel (FSM)

- [x] 5.1 Create `features/pedidos/hooks/useOrderActions.ts` — mutation hooks for `PATCH /api/pedidos/{id}/estado`
- [x] 5.2 Create `features/pedidos/components/StateTransitionButton.tsx` — button that shows available next states based on current estado_codigo and FSM
- [x] 5.3 Create `features/pedidos/components/TransitionModal.tsx` — confirmation modal with reason field (required for cancel, optional for others)
- [x] 5.4 Create `features/pedidos/components/OrderTable.tsx` — table of all orders with status badge, client name, date, total, and action buttons column
- [x] 5.5 Create `features/pedidos/index.ts` barrel export
- [x] 5.6 Implement `pages/pedidos/OrdersPanelPage.tsx` — fetch all orders via `GET /api/v1/pedidos`, render OrderTable with status filters and auto-refresh
- [x] 5.7 Wire transition modals: show confirmation on action click, call mutation on confirm, handle errors inline

## 6. Config & Verification

- [x] 6.1 Verify MP_ACCESS_TOKEN and MP_PUBLIC_KEY are properly loaded from env in settings
- [x] 6.2 Verify webhook endpoint is publicly accessible (POST /api/v1/pagos/webhook)
- [x] 6.3 Verify callback URLs in MercadoPago preference point to correct frontend routes
- [x] 6.4 Verify PEDIDOS role user can access `/orders-panel` and perform state transitions (route exists with RoleGuard)
- [x] 6.5 Verify CLIENT role user CANNOT access `/orders-panel` (RoleGuard active)
