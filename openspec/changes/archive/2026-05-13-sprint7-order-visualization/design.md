# Design: sprint7-order-visualization

## Architecture Overview

Mejorar el panel de gestión de pedidos existente y crear una página de detalle para gestores/admin. Reutilizar componentes existentes (OrderTable, StateTransitionButton, TransitionModal, etc.).

## US-051: Enhanced Orders Panel

### Backend — GET /api/v1/pedidos con filtros
Agregar query params al endpoint existente:
- `?q=búsqueda` — busca por ID de pedido o nombre de cliente (ILIRE)
- `?desde=fecha` — fecha inicial (ISO)
- `?hasta=fecha` — fecha final (ISO)
- `?page=1&limit=20` — paginación server-side
- `?estado=CONFIRMADO` — filtro por estado

### Frontend — OrdersPanelPage
Agregar sobre la página existente:
- Input de búsqueda (por #pedido o nombre cliente)
- Date range picker (inputs tipo date)
- Paginación server-side en lugar de client-side

## US-052: Gestor/Admin Order Detail

### Frontend — Nueva página: OrderDetailPanelPage
Ruta: `/orders-panel/:id` (bajo RoleGuard PEDIDOS/ADMIN)
- Reutiliza el layout de OrderDetailPage pero agrega:
  - Sección de datos del cliente (nombre, email)
  - Botones FSM inline (StateTransitionButton)
  - Historial completo con actor (usuario o SISTEMA)

### Frontend — API hooks
Agregar:
- `useAllPedidos` mejorado con query params de filtro
- `useBuscarPedidos` con soporte de búsqueda y paginación

### Routing
Agregar ruta `/orders-panel/:id` al grupo PEDIDOS/ADMIN.

## Componentes

### widgets/pedidos/OrderSearchBar.tsx
Input de búsqueda + date range + botón buscar.
Props: `onSearch(filters: OrderFilters)`

### widgets/pedidos/OrderDetailPanel.tsx
Detalle completo con datos del cliente + FSM actions.
Props: `pedido: Pedido`, `historial`, `pagos`, `onTransition`

## Data Types

```typescript
interface OrderFilters {
  q?: string          // Search query
  estado?: string     // Status filter
  desde?: string      // Date from (ISO)
  hasta?: string      // Date to (ISO)
  page?: number
  limit?: number
}
```

## Notas de Implementación

- Reutilizar OrderTable y StateTransitionButton existentes
- El detalle para admin es una página nueva, no un modal
- La búsqueda usa debounce para evitar requests innecesarios
- Los filtros de fecha usan inputs nativos `<input type="date">`
