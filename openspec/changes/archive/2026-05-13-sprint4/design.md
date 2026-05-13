## Context

Sprint 4 cubre el frontend faltante para dos EPICs completadas a nivel lógica de negocio pero sin interfaz de usuario:

**EPIC 07 — Direcciones de Entrega**
- Backend: ✅ CRUD completo en `backend/app/modules/direcciones/` (model, schemas, repository, service, router con 6 endpoints)
- Frontend types: ✅ `DireccionEntrega` definido en `entities/types/index.ts`
- Frontend route: ✅ `/addresses` definida en `routes.ts`
- Navbar item: ✅ Ya incluido en `CLIENT_ITEMS` ("Mis Direcciones")
- Frontend API layer: ❌ No existe `direccionesApi.ts`
- Frontend pages/components: ❌ No existen

**EPIC 08 — Carrito de Compras**
- Store Zustand: ✅ `cartStore.ts` completo con persistencia localStorage y todas las acciones (addItem, removeItem, updateQuantity, clearCart, toggleCart, totalItems, totalPrice)
- Frontend route: ✅ `/cart` definida en `routes.ts`
- Navbar item: ✅ Ya incluido en `CLIENT_ITEMS` ("Mi Carrito")
- CartPage: ⚠️ Placeholder de 8 líneas ("Próximamente")
- CartDrawer: ❌ No existe (el store tiene `isOpen` / `toggleCart` pero nadie lo usa)
- Add-to-cart en ProductCard/ProductDetail: ❌ No existe
- Exclusión de ingredientes: ❌ No hay UI para personalizar productos al agregar al carrito

## Goals / Non-Goals

**Goals:**
- Implementar frontend completo de gestión de direcciones de entrega (listar, crear, editar, eliminar, predeterminada)
- Implementar UI completa del carrito de compras (drawer, página, add-to-cart, exclusión de ingredientes, modificar cantidades, vaciar)
- Conectar el store Zustand existente con la UI
- Agregar badge de cantidad de items al link del carrito en el navbar

**Non-Goals:**
- NO se toca el backend de direcciones (ya está completo)
- NO se toca el store Zustand del carrito (ya está completo)
- NO se implementa checkout ni flujo de pago (Sprint 5+)
- NO se implementa UI de admin para productos (Sprint 8, EPIC 16)
- NO se cambia la navegación existente más allá del badge del carrito

## Decisions

### 1. Estructura del feature `direcciones/`

**Decisión**: Seguir Feature-Sliced Design con API layer en entities, componentes en features.

```
frontend/src/
├── entities/api/direccionesApi.ts    ← API calls (TanStack Query hooks)
├── features/direcciones/
│   ├── components/
│   │   ├── DireccionCard.tsx          ← Card individual de dirección
│   │   └── DireccionForm.tsx          ← Formulario crear/editar
│   └── index.ts
├── pages/DireccionesPage.tsx         ← Página principal de gestión
```

**API endpoints a consumir** (backend existente):
| Frontend Hook | Método | Endpoint | Auth |
|---|---|---|---|
| `useDirecciones()` | GET | `/api/v1/direcciones/usuario/{id}` | No (público) |
| `useCreateDireccion()` | POST | `/api/v1/direcciones` | Sí |
| `useUpdateDireccion()` | PUT | `/api/v1/direcciones/{id}` | Sí |
| `useSetPrincipal()` | PATCH | `/api/v1/direcciones/{id}/principal` | Sí |
| `useDeleteDireccion()` | DELETE | `/api/v1/direcciones/{id}` | Sí |

**Alternativa considerada**: Agregar endpoint protegido `GET /api/v1/direcciones/mis-direcciones` que filtre por JWT. Descartado porque el endpoint actual acepta `usuario_id` por path y podemos obtener el ID del usuario autenticado desde `authStore`.

### 2. Add-to-cart: desde ProductDetail con selector de ingredientes

**Decisión**: El botón "Agregar al carrito" se coloca en `ProductDetail.tsx`, no en `ProductCard`. La card del grid es informativa (por diseño del proyecto — mostrar precio y foto, no acción directa).

En `ProductDetail` se agrega:
- Selector de cantidad (input numérico, min 1)
- Lista de ingredientes removibles con checkboxes para excluir
- Botón "Agregar al carrito" que llama a `useCartStore.addItem(producto, cantidad, exclusiones)`

**Alternativa considerada**: Agregar add-to-cart también en ProductCard. Descartado porque:
- La card en el grid no tiene espacio para selectores de exclusión de ingredientes
- No es consistente con el diseño actual (la card navega al detalle)
- US-030 requiere personalización (exclusión de ingredientes) que necesita más UI que una card

### 3. CartDrawer: sidebar lateral

**Decisión**: Implementar CartDrawer como un componente overlay que se abre desde cualquier página vía `toggleCart()` del store.

- Posición: derecha, ancho fijo (w-96 en desktop, full en mobile)
- Contenido: lista de items con cantidad, precio, exclusiones, subtotal
- Footer: total general + botón "Ir al carrito" → navega a `/cart`
- Estado vacío: "Tu carrito está vacío" con link al catálogo
- Se renderiza en `Layout.tsx` para estar disponible globalmente

**Alternativa considerada**: Drawer solo en páginas de catálogo. Descartado porque el store ya soporta `isOpen` global y es más consistente tenerlo disponible desde cualquier página.

### 4. CartPage: página completa

**Decisión**: Reemplazar el placeholder con:
- Tabla/lista completa de items con: imagen, nombre, exclusiones, cantidad (input +/-), subtotal
- Botón "Eliminar" por item
- Botón "Vaciar carrito" con confirmación modal
- Resumen a la derecha (o abajo en mobile) con subtotal, total
- Botón "Proceder al checkout" (deshabilitado — Sprint 5)
- Estado vacío con link al catálogo

### 5. Badge de carrito en navbar

**Decisión**: El `NavItem` de "Mi Carrito" no se modifica (es un NavLink). En cambio, se agrega un badge circular con la cantidad total de items (`useCartStore.totalItems()`) junto al icono 🛒.

Se implementa como componente `CartBadge` inline en el navbar, renderizado solo cuando `totalItems() > 0`.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **Endpoint GET /api/v1/direcciones/usuario/{id} no está protegido** — cualquier usuario autenticado podría listar direcciones de otro usuario si conoce su ID | En el frontend siempre usamos el ID del usuario autenticado desde `authStore`. A futuro se puede agregar protección en backend |
| **El carrito es client-side** — si el usuario borra localStorage o cambia de navegador, pierde el carrito | Es un trade-off aceptable para MVP. El carrito solo necesita persistir durante la sesión de compra. A futuro se puede agregar sincronización con backend |
| **Personalización de ingredientes** — la exclusión se almacena como `number[]` en el store, pero al crear un pedido (Sprint 5+) debe enviarse al backend como `INTEGER[]` | El store ya soporta `personalizacion?: number[]`. El contrato está definido, solo falta conectarlo en el checkout |
| **Navbar ya muestra Mi Carrito y Mis Direcciones** — los links existen pero las páginas están vacías | No hay riesgo. Solo reemplazar los placeholders con implementaciones reales |
