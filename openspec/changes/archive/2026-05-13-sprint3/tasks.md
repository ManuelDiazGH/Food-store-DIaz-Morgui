# Tasks — Sprint 3: Productos + Perfil del Cliente

## 1. Backend — Productos: Esquemas (Schemas)

- [x] 1.1 Crear `ProductoCategoriaRead` schema en `productos/schemas.py` (id, nombre, es_principal)
- [x] 1.2 Crear `ProductoIngredienteRead` schema en `productos/schemas.py` (id, nombre, es_alergeno, es_removible)
- [x] 1.3 Crear `ProductoCatalogoRead` schema — respuesta pública (id, nombre, precio_base, imagen, disponible, categorias: list[str])
- [x] 1.4 Crear `ProductoDetalleRead` schema — respuesta completa (id, nombre, descripcion, precio_base, imagen, hay_stock, categorias, ingredientes con alergeno flag)
- [x] 1.5 Crear `ProductoCategoriasUpdate` schema — body para PUT /productos/:id/categorias
- [x] 1.6 Crear `ProductoIngredientesUpdate` schema — body para PUT /productos/:id/ingredientes
- [x] 1.7 Crear `StockUpdate` schema — body para PATCH /productos/:id/stock (cantidad, tipo: incremento|absoluto)
- [x] 1.8 Crear `ProductoListResponse` schema — respuesta paginada (items, total, page, limit)

## 2. Backend — Productos: Repositorio

- [x] 2.1 Agregar `get_by_id_with_relations` en ProductoRepository — join con ProductoCategoria, ProductoIngrediente, Categoria, Ingrediente
- [x] 2.2 Agregar `get_catalog` en ProductoRepository — query paginada con filtros (categoria, busqueda ILIKE, excluirAlergenos NOT EXISTS)
- [x] 2.3 Agregar `get_categoria_ids` — obtener IDs de categorías asociadas a un producto
- [x] 2.4 Agregar `get_ingrediente_ids` — obtener IDs de ingredientes asociados a un producto
- [x] 2.5 Agregar `update_stock_atomic` — UPDATE con incremento o seteo absoluto, WHERE stock + delta >= 0
- [x] 2.6 Renombrar/modificar `delete` existente para soft delete — set `eliminado_en = now()` en vez de borrado físico

## 3. Backend — Productos: Service

- [x] 3.1 Agregar `ProductoService.associate_categorias(uow, producto_id, categoria_ids)` — validar que las categorías existen, borrar asociaciones previas, crear nuevas
- [x] 3.2 Agregar `ProductoService.associate_ingredientes(uow, producto_id, ingredientes_data)` — validar ingredientes, reemplazar asociaciones
- [x] 3.3 Agregar `ProductoService.get_catalog(uow, filtros)` — llamar repository con filtros, devolver respuesta paginada
- [x] 3.4 Agregar `ProductoService.get_detalle(uow, producto_id)` — obtener producto con relaciones, calcular hay_stock, mapear a schema
- [x] 3.5 Agregar `ProductoService.update_stock(uow, producto_id, data)` — llamada a `update_stock_atomic`, manejar error de stock insuficiente
- [x] 3.6 Modificar `ProductoService.delete` existente para usar soft delete (set eliminado_en)
- [x] 3.7 Agregar validación en `ProductoService.update` — precio > 0, max 2 decimales, stock >= 0

## 4. Backend — Productos: Router

- [x] 4.1 Agregar `PUT /api/v1/productos/:id/categorias` — requiere rol STOCK o ADMIN, llama associate_categorias
- [x] 4.2 Agregar `PUT /api/v1/productos/:id/ingredientes` — requiere rol STOCK o ADMIN, llama associate_ingredientes
- [x] 4.3 Modificar `GET /api/v1/productos` — aceptar query params (categoria, busqueda, excluirAlergenos, page, limit, incluir_eliminados), llamar get_catalog
- [x] 4.4 Modificar `GET /api/v1/productos/:id` — retornar ProductoDetalleRead con categorías, ingredientes y alergenos
- [x] 4.5 Agregar `PATCH /api/v1/productos/:id/stock` — requiere rol STOCK o ADMIN, body con cantidad y tipo
- [x] 4.6 Modificar `DELETE /api/v1/productos/:id` — asegurar soft delete (eliminar_en) en vez de borrado físico, restringir a ADMIN

## 5. Backend — Perfil: Módulo nuevo

- [x] 5.1 Crear `app/modules/perfil/` con `__init__.py`
- [x] 5.2 Crear `perfil/schemas.py` — PerfilRead, PerfilUpdate (nombre, telefono), PasswordChange (password_actual, password_nueva)
- [x] 5.3 Crear `perfil/service.py` — get_perfil, update_perfil, change_password (validar actual, hashear nueva, revocar tokens)
- [x] 5.4 Crear `perfil/router.py` — GET /perfil, PUT /perfil, PUT /perfil/password (todos requieren auth)
- [x] 5.5 Registrar router de perfil en `app/main.py`

## 6. Backend — Migración Alembic (si es necesario)

- [x] 6.1 Verificar que las tablas ProductoCategoria y ProductoIngrediente existen en la BD (ya deberían estar por seed de Sprint 0)
- [x] 6.2 Verificar que la columna `eliminado_en` en Producto soporta soft delete (ya existe en el modelo)
- [ ] 6.3 Si hay cambios en modelos, generar migración con `alembic revision --autogenerate` y aplicar `alembic upgrade head`

## 7. Frontend — API Hooks: Productos y Perfil

- [x] 7.1 Crear `entities/api/productosApi.ts` — TanStack Query hooks: useProductos (list con filtros), useProductoDetalle, useCreateProducto, useUpdateProducto, useDeleteProducto, useAssociateCategorias, useAssociateIngredientes, useUpdateStock
- [x] 7.2 Crear `entities/api/perfilApi.ts` — TanStack Query hooks: usePerfil, useUpdatePerfil, useChangePassword

## 8. Frontend — Catálogo Público (US-018, US-019, US-023)

- [x] 8.1 Crear `features/catalogo/components/ProductCard.tsx` — card de producto (nombre, precio, imagen, disponible)
- [x] 8.2 Crear `features/catalogo/components/ProductGrid.tsx` — grilla responsive de ProductCards con paginación
- [x] 8.3 Crear `features/catalogo/components/ProductFilters.tsx` — sidebar con filtro de categoría y búsqueda por nombre
- [x] 8.4 Crear `features/catalogo/components/AllergenFilter.tsx` — checkboxes de ingredientes con es_alergeno para exclusión
- [x] 8.5 Crear `features/catalogo/components/ProductDetail.tsx` — detalle completo con ingredientes, alergenos destacados, categorías
- [x] 8.6 Actualizar `pages/HomePage.tsx` o crear `pages/CatalogPage.tsx` — integrar ProductGrid + filters
- [x] 8.7 Crear `pages/ProductDetailPage.tsx` — ruta /productos/:id con detalle completo

## 9. Frontend — Admin Productos (US-015, US-016, US-017, US-020, US-021, US022)

- [ ] 9.1 Crear `features/stock/components/ProductForm.tsx` — formulario crear/editar producto (nombre, descripcion, precio, stock, imagen, disponible)
- [ ] 9.2 Crear `features/stock/components/ProductCategorySelect.tsx` — multi-select de categorías para asociar
- [ ] 9.3 Crear `features/stock/components/ProductIngredientSelect.tsx` — multi-select de ingredientes con toggle es_removible
- [ ] 9.4 Crear `features/stock/components/StockManager.tsx` — modal/form para gestión de stock (incremento/absoluto)
- [ ] 9.5 Crear `pages/stock/ProductListPage.tsx` — tabla de productos con acciones (editar, eliminar, stock)
- [ ] 9.6 Crear `pages/stock/ProductCreatePage.tsx` — formulario de creación con asociaciones
- [ ] 9.7 Crear `pages/stock/ProductEditPage.tsx` — formulario de edición con categorías, ingredientes y stock

## 10. Frontend — Perfil del Cliente (US-061, US-062, US-063)

- [x] 10.1 Reemplazar `pages/ProfilePage.tsx` placeholder con vista completa — nombre, email (readonly), telefono, fecha registro
- [x] 10.2 Crear `features/profile/components/ProfileEditForm.tsx` — formulario editar nombre y teléfono, email deshabilitado
- [x] 10.3 Crear `features/profile/components/PasswordChangeForm.tsx` — formulario contraseña actual + nueva + confirmación
- [x] 10.4 Integrar en ProfilePage: tabs o secciones para Ver perfil, Editar perfil, Cambiar contraseña

## 11. Frontend — Routing

- [x] 11.1 Agregar rutas públicas: `/` (catálogo), `/productos/:id` (detalle)
- [x] 11.2 Agregar rutas protegidas: `/stock/productos`, `/stock/productos/nuevo`, `/stock/productos/:id/editar` (roles STOCK y ADMIN)
- [x] 11.3 Agregar ruta protegida: `/perfil` (cualquier rol autenticado)
- [ ] 11.4 Actualizar Navbar con links a Catálogo y Perfil según rol

## 12. Verificación y testing

- [ ] 12.1 Verificar que `GET /api/v1/productos` con filtros funciona correctamente (categoría, búsqueda, alérgenos, paginación)
- [ ] 12.2 Verificar que `GET /api/v1/productos/:id` retorna detalle con categorías, ingredientes y alergenos
- [ ] 12.3 Verificar que `PUT /productos/:id/categorias` y `PUT /productos/:id/ingredientes` funcionan con M2M
- [ ] 12.4 Verificar que `PATCH /productos/:id/stock` funciona en modo incremento y absoluto
- [ ] 12.5 Verificar que `DELETE /productos/:id` hace soft delete (eliminado_en)
- [ ] 12.6 Verificar que `GET /perfil`, `PUT /perfil`, `PUT /perfil/password` funcionan correctamente
- [ ] 12.7 Verificar que cambio de contraseña revoca todos los refresh tokens
- [ ] 12.8 Verificar que el frontend de catálogo muestra productos y filtra correctamente
- [ ] 12.9 Verificar que el frontend de perfil permite ver, editar y cambiar contraseña
- [ ] 12.10 Verificar que los roles STOCK/ADMIN pueden gestionar productos y un CLIENT no puede
- [ ] 12.11 `npm run build` exitoso en frontend sin errores