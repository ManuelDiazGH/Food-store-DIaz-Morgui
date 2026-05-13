## Why

Sprint 4 habilita dos funcionalidades core para que los clientes puedan gestionar sus direcciones de entrega y armar su carrito de compras. Sin estas dos EPICs, el flujo de compra no puede completarse.

- **EPIC 07 — Direcciones de Entrega (US-024 a US-028)**: Los clientes necesitan poder gestionar sus direcciones de entrega (alta, consulta, edición, baja, predeterminada) para recibir pedidos. El backend ya está implementado en sprints anteriores; falta la UI de frontend.
- **EPIC 08 — Carrito de Compras (US-029 a US-034)**: Los clientes necesitan un carrito funcional para armar su pedido (agregar productos, personalizar exclusiones de ingredientes, modificar cantidades, ver resumen, vaciar). El store Zustand con persistencia ya está implementado; falta la UI completa (páginas, widgets, drawer).

## What Changes

### EPIC 07 — Direcciones de Entrega (US-024 a US-028)
- **Frontend**: Crear feature `direcciones/` con API layer, componentes y páginas para:
  - Listar direcciones del cliente autenticado (US-025)
  - Crear nueva dirección (US-024)
  - Editar dirección existente (US-026)
  - Eliminar dirección (US-027)
  - Establecer/ cambiar dirección predeterminada (US-028)
- **Backend**: Sin cambios — el módulo `direcciones/` ya está completo con CRUD, soft delete y endpoints protegidos

### EPIC 08 — Carrito de Compras (US-029 a US-034)
- **Frontend**: Completar la UI del carrito:
  - CartDrawer: drawer lateral con resumen rápido del carrito
  - CartPage: página completa con detalle de items, exclusiones, subtotales y total
  - Agregar al carrito desde el catálogo con selección de exclusión de ingredientes (US-030)
  - Modificar cantidades en el carrito (US-031)
  - Eliminar items individuales (US-032)
  - Vaciar carrito con confirmación modal (US-034)
- **Backend**: Sin cambios — el carrito es 100% client-side (Zustand + localStorage)

### UI compartida
- Actualizar navegación: link al carrito en el header, link a direcciones en el perfil
- Agregar ruta `/addresses` (ya definida en routes.ts, sin componente)

## Capabilities

### New Capabilities
- `delivery-addresses-frontend`: Gestión de direcciones de entrega del cliente — listado, creación, edición, eliminación y selección de dirección predeterminada desde el frontend
- `shopping-cart-frontend`: Carrito de compras client-side — agregar/quitar productos, personalizar exclusiones de ingredientes, modificar cantidades, ver resumen con subtotales y total, vaciar carrito

### Modified Capabilities
<!-- Sin cambios en specs existentes — el backend ya está implementado y el store Zustand no requiere cambios de comportamiento a nivel spec -->

## Impact

- **Frontend**: Nuevos archivos en `features/direcciones/`, actualización en `features/cart/`, nuevo `pages/DireccionesPage.tsx`, actualización de `pages/CartPage.tsx`
- **Backend**: Sin impacto — el módulo `direcciones/` ya está completo y el carrito no requiere backend
- **Dependencias**: El store Zustand `cartStore` ya existe y el backend de direcciones también. Sprint 4 es puramente frontend para ambas EPICs
- **Navegación**: Header necesita badge de items en carrito + link a `/cart`; perfil necesita link a `/addresses`
