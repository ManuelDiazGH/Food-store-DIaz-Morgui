# Design: admin-product-crud

## Architecture Overview

Agregar las páginas faltantes de gestión de productos para roles STOCK y ADMIN, siguiendo el mismo patrón de las páginas existentes de `IngredientsAdmin` y `CategoriesAdmin`. Usar la feature-slice existente: DataTable, modales inline, hooks TanStack Query con toasts, y widgets en `features/stock/`.

## Componentes

### features/stock/api/productos.ts
- **Responsabilidad**: Hooks TanStack Query con toasts para operaciones CRUD de productos (siguiendo patrón de `features/admin/api/ingredientes.ts`)
- **Ubicación**: `frontend/src/features/stock/api/productos.ts`
- **Depende de**: `entities/api/productosApi.ts` (raw HTTP hooks existentes)

### widgets/stock/ProductTable.tsx
- **Responsabilidad**: Tabla paginada de productos usando DataTable, con columnas: nombre, precio, stock, disponible, categorías, acciones (editar/eliminar/stock)
- **Ubicación**: `frontend/src/widgets/stock/ProductTable.tsx`

### widgets/stock/ProductForm.tsx
- **Responsabilidad**: Modal formulario crear/editar producto. Campos: nombre, descripción, precio, stock_cantidad, imagen URL, disponible (toggle). En modo edición, precarga datos.
- **Ubicación**: `frontend/src/widgets/stock/ProductForm.tsx`

### widgets/stock/ProductCategorySelect.tsx
- **Responsabilidad**: Multi-select de categorías para asociar a un producto. Muestra checkboxes con nombres de categorías disponibles.
- **Ubicación**: `frontend/src/widgets/stock/ProductCategorySelect.tsx`

### widgets/stock/ProductIngredientSelect.tsx
- **Responsabilidad**: Multi-select de ingredientes con toggle de `es_removible`. Cada ingrediente tiene un checkbox y, si está seleccionado, un toggle para marcarlo como removible.
- **Ubicación**: `frontend/src/widgets/stock/ProductIngredientSelect.tsx`

### widgets/stock/StockManager.tsx
- **Responsabilidad**: Modal para gestión de stock. Permite seleccionar modo (incremento o absoluto) e ingresar cantidad. Valida que el resultado sea >= 0.
- **Ubicación**: `frontend/src/widgets/stock/StockManager.tsx`

### widgets/stock/ProductDeleteConfirm.tsx
- **Responsabilidad**: Confirmación de eliminación de producto (soft delete), envuelve ConfirmDialog
- **Ubicación**: `frontend/src/widgets/stock/ProductDeleteConfirm.tsx`

### pages/stock/ProductListPage.tsx
- **Responsabilidad**: Página principal de gestión de productos. Tabla con acciones y botón "Nuevo Producto". Reemplaza el placeholder actual en `/stock/productos`.
- **Ubicación**: `frontend/src/pages/stock/ProductListPage.tsx`

### pages/stock/ProductCreatePage.tsx
- **Responsabilidad**: Página con formulario completo de creación de producto, incluyendo asociación de categorías e ingredientes. Redirige a lista al crear.
- **Ubicación**: `frontend/src/pages/stock/ProductCreatePage.tsx`

### pages/stock/ProductEditPage.tsx
- **Responsabilidad**: Página con formulario completo de edición de producto, precargando datos existentes. Incluye gestor de stock, categorías e ingredientes.
- **Ubicación**: `frontend/src/pages/stock/ProductEditPage.tsx`

## Navbar Updates

Agregar link "Catálogo" en CLIENT_ITEMS si no existe (para ir a `/catalogo`) y "Mi Perfil" (para ir a `/perfil`). Ya existen estos items según la exploración, verificar estado actual.

## Rutas

Agregar en router.tsx:
- `/stock/productos` → `ProductListPage` (reemplaza placeholder)
- `/stock/productos/nuevo` → `ProductCreatePage` (STOCK/ADMIN)
- `/stock/productos/:id/editar` → `ProductEditPage` (STOCK/ADMIN)

## Patrón de Datos

```typescript
// ProductoCatalogoRead (existente)
interface ProductoCatalogoRead {
  id: number; nombre: string; precio_base: number;
  imagen?: string; disponible: boolean; categorias: string[];
}

// ProductoCreate (existente)
interface ProductoCreate {
  nombre: string; descripcion?: string; precio_base: number;
  stock_cantidad: number; imagen?: string; disponible: boolean;
}

// StockUpdate (existente)
interface StockUpdate {
  cantidad: number; tipo: 'incremento' | 'absoluto';
}
```

## Notas de Implementación

- Seguir el patrón de `IngredientsAdmin`: página usa widgets que envuelven DataTable y modales
- Los hooks TanStack Query deben usar `useToast()` para feedback al usuario (patrón de `features/admin/api/`)
- Las mutaciones deben invalidar `['productos']` después de éxito
- Usar lazy loading para las nuevas páginas en el router
- El formulario ProductForm debe funcionar tanto para crear como para editar (prop `initialData?: ProductoDetalleRead`)

## Tareas Verificación

- `npm run build` sin errores
- Navegación a `/stock/productos` muestra tabla
- Crear producto funciona con categorías e ingredientes
- Editar producto precarga datos correctamente
- Gestión de stock funciona en modo incremento y absoluto
- Soft delete funciona (producto desaparece de lista)
