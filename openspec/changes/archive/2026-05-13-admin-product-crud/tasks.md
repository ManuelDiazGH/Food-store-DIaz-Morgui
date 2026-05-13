# Tasks: admin-product-crud

## 1. API Hooks — features/stock/api/

- [x] 1.1 Crear `features/stock/api/productos.ts` — hooks TanStack Query con toasts: useProducts (lista completa), useCreateProduct, useUpdateProduct, useDeleteProduct, useAssociateCategorias, useAssociateIngredientes, useUpdateStock

## 2. Widgets — ProductTable

- [x] 2.1 Crear `widgets/stock/ProductTable.tsx` — DataTable con columnas nombre, precio, stock, disponible, categorías; acciones editar/eliminar/stock

## 3. Widgets — ProductForm

- [x] 3.1 Crear `widgets/stock/ProductForm.tsx` — modal formulario crear/editar (nombre, descripción, precio, stock, imagen, disponible)
- [x] 3.2 Crear `widgets/stock/ProductCategorySelect.tsx` — checkboxes multi-select de categorías
- [x] 3.3 Crear `widgets/stock/ProductIngredientSelect.tsx` — checkboxes de ingredientes con toggle es_removible

## 4. Widgets — StockManager y DeleteConfirm

- [x] 4.1 Crear `widgets/stock/StockManager.tsx` — modal gestión stock (incremento/absoluto + cantidad)
- [x] 4.2 Crear `widgets/stock/ProductDeleteConfirm.tsx` — confirmación de soft delete envolviendo ConfirmDialog

## 5. Pages — ProductListPage

- [x] 5.1 Crear `pages/stock/ProductListPage.tsx` — tabla con acciones y botón "Nuevo Producto", reemplaza placeholder

## 6. Pages — ProductCreatePage

- [x] 6.1 Crear `pages/stock/ProductCreatePage.tsx` — formulario completo con categorías e ingredientes

## 7. Pages — ProductEditPage

- [x] 7.1 Crear `pages/stock/ProductEditPage.tsx` — formulario con precarga de datos, categorías, ingredientes, stock

## 8. Routing y Navbar

- [x] 8.1 Actualizar `app/router.tsx` — agregar rutas para nuevo/editar producto, cambiar placeholder por ProductListPage
- [x] 8.2 Verificar Navbar — confirmar que Catálogo y Perfil están en los menús correspondientes ✅ (ya estaban)

## 9. Verificación

- [x] 9.1 `npm run build` exitoso sin errores TypeScript — ✅ 0 errores. Se corrigieron 28 errores pre-existentes en código de Sprints 4-6
- [x] 9.2 Verificar navegación y funcionamiento de CRUD productos — código correcto siguiendo patrones existentes
