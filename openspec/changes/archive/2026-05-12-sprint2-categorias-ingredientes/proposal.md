## Why

El backend ya tiene módulos básicos de Categorías e Ingredientes en Sprint 0 (CRUD + soft delete), pero **les faltan funcionalidades críticas** definidas en las historias de usuario:

- **Categorías**: No existe el endpoint de árbol jerárquico con CTE recursivo (US-008), la edición no valida ciclos en `padre_id` (US-009), y el soft delete no maneja la reasignación de subcategorías (US-010). Tampoco el rol STOCK puede crear/editar — solo ADMIN tiene acceso.
- **Ingredientes**: El módulo ya tiene CRUD completo, pero necesita que el rol STOCK además de ADMIN pueda gestionar ingredientes, y los filtros de paginación y alérgenos deben estar completos y probados.
- **Frontend**: No existe ninguna interfaz para gestionar categorías ni ingredientes. Los Gestores de Stock y Administradores no tienen forma de administrar el catálogo sin API directa.

Este change desbloquea el **Sprint 3** (Productos) que depende de categorías e ingredientes para las asociaciones M2M.

## What Changes

### Backend — Categorías (mejoras)
- Agregar endpoint `GET /api/v1/categorias/tree` que retorna la jerarquía completa como árbol anidado usando CTE recursivo (US-008)
- Modificar `PUT /api/v1/categorias/{id}` para permitir cambio de `padre_id` con validación de ciclos (US-009)
- Modificar `DELETE /api/v1/categorias/{id}` para validar subcategorías huérfanas — rechazar si tiene subcategorías activas (US-010)
- Agregar rol STOCK además de ADMIN a los endpoints de escritura de categorías (RN-RB06: STOCK gestiona catálogo)
- Modificar `GET /api/v1/categorias` (público) para excluir categorías eliminadas lógicamente

### Backend — Ingredientes (mejoras menores)
- Agregar rol STOCK además de ADMIN a los endpoints de escritura (RN-RB06)
- Verificar que el filtro `?alergeno=true` y la paginación funcionen correctamente en el endpoint existente
- El módulo ya está funcional desde Sprint 0 — solo requiere ajustes de roles

### Frontend — Páginas de gestión (nuevo)
- Crear página de administración de categorías con árbol jerárquico interactivo (crear, editar, reordenar, eliminar)
- Crear página de administración de ingredientes con tabla, filtros de alérgenos, y CRUD completo
- Crear componentes compartidos de UI (tabla, formularios, confirmación de eliminación)
- Proteger rutas de administración con guards RBAC (solo ADMIN y STOCK)

## Capabilities

### New Capabilities
- `categorias-tree`: Endpoint y lógica CTE recursivo para árbol jerárquico de categorías, validación de ciclos en `padre_id`, y manejo de subcategorías huérfanas en soft delete
- `ingredientes-crud-frontend`: Interfaz de gestión de ingredientes para roles ADMIN/STOCK con filtros, paginación y CRUD
- `categorias-crud-frontend`: Interfaz de gestión de categorías en árbol jerárquico para roles ADMIN/STOCK con validación de ciclos y reasignación
- `shared-admin-ui`: Componentes UI compartidos para administración (tabla, formularios, confirmaciones, toasts, guards RBAC)

### Modified Capabilities
- `categorias-backend`: Agregar validación de ciclos en update, validación de subcategorías en delete, rol STOCK en endpoints de escritura, CTE recursivo en listado
- `ingredientes-backend`: Agregar rol STOCK en endpoints de escritura (ADMIN + STOCK en vez de solo ADMIN)

## Impact

### Backend
- `app/modules/categorias/service.py` — Agregar `get_tree()`, modificar `update()` con validación de ciclos, modificar `delete()` con validación de subcategorías
- `app/modules/categorias/router.py` — Agregar endpoint `/tree`, modificar permisos de roles
- `app/modules/categorias/schemas.py` — Agregar `CategoriaTreeNode`, modificar `CategoriaUpdate` para incluir `padre_id`
- `app/modules/categorias/repository.py` — Agregar método CTE recursivo, consulta de subcategorías
- `app/modules/ingredientes/router.py` — Modificar permisos para ADMIN + STOCK
- `app/core/uow.py` — Sin cambios (ya expone `categorias` e `ingredientes`)

### Frontend
- `src/pages/admin/` — Nuevas páginas CategoriesAdmin, IngredientsAdmin
- `src/widgets/admin/` — CategoryTree, IngredientTable widgets
- `src/features/admin/` — Stores, API hooks, formularios
- `src/shared/ui/` — DataTable, ConfirmDialog, Toast components
- `src/shared/utils/` — Route guards RBAC

### Base de datos
- Sin cambios de esquema — las tablas ya existen desde US-000b

### APIs
- `GET /api/v1/categorias/tree` — **NUEVO** endpoint público
- `PUT /api/v1/categorias/{id}` — **MODIFICADO** acepta `padre_id` + validación de ciclos
- `DELETE /api/v1/categorias/{id}` — **MODIFICADO** valida subcategorías huérfanas
- `POST/PUT/DELETE /api/v1/categorias` — **MODIFICADO** permisos ADMIN → ADMIN + STOCK
- `POST/PUT/DELETE /api/v1/ingredientes` — **MODIFICADO** permisos ADMIN → ADMIN + STOCK