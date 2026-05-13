## 1. Backend — Categorías: CTE Recursivo y Árbol Jerárquico

- [x] 1.1 Crear schema `CategoriaTreeNode` en `categorias/schemas.py` con campo `subcategorias: list[CategoriaTreeNode]` recursivo
- [x] 1.2 Agregar método `get_tree()` en `CategoriaRepository` con CTE recursivo (`WITH RECURSIVE`) que retorne la jerarquía completa
- [x] 1.3 Agregar `CategoriaService.get_tree()` que construya el árbol anidado desde el resultado del CTE
- [x] 1.4 Agregar endpoint `GET /api/v1/categorias/tree` (público, sin auth) que retorne `list[CategoriaTreeNode]`

## 2. Backend — Categorías: Validación de Ciclos en padre_id

- [x] 2.1 Agregar método `has_cycle()` en `CategoriaRepository` que use CTE recursivo para verificar si un `padre_id` crearía un ciclo
- [x] 2.2 Agregar `padre_id: Optional[int] = None` al schema `CategoriaUpdate` para permitir cambio de jerarquía
- [x] 2.3 Modificar `CategoriaService.update()` para validar ciclos antes de persistir cambio de `padre_id`
- [ ] 2.4 Agregar test: update de `padre_id` con ciclo directo → 409
- [ ] 2.5 Agregar test: update de `padre_id` con ciclo indirecto → 409
- [ ] 2.6 Agregar test: update de `padre_id` sin ciclo → 200 OK

## 3. Backend — Categorías: Soft Delete con Validación de Subcategorías

- [x] 3.1 Modificar `CategoriaService.delete()` para verificar subcategorías activas antes de soft-delete
- [x] 3.2 Agregar consulta en repository que cuente subcategorías activas (`padre_id = id AND eliminado_en IS NULL`)
- [x] 3.3 Retornar 409 con mensaje "No se puede eliminar una categoría con subcategorías activas" si tiene hijos activos
- [ ] 3.4 Agregar test: delete categoría con subcategorías activas → 409
- [ ] 3.5 Agregar test: delete categoría con solo subcategorías soft-deleted → 204
- [ ] 3.6 Agregar test: delete categoría hoja sin subcategorías → 204

## 4. Backend — Permisos RBAC: STOCK en Categorías e Ingredientes

- [x] 4.1 Cambiar `Depends(require_role("ADMIN"))` a `Depends(require_role("ADMIN", "STOCK"))` en POST/PUT/DELETE de `categorias/router.py`
- [x] 4.2 Cambiar `Depends(require_role("ADMIN"))` a `Depends(require_role("ADMIN", "STOCK"))` en POST/PUT/DELETE de `ingredientes/router.py`
- [x] 4.3 Verificar que GET endpoints de categorías sigan siendo públicos (sin auth)
- [x] 4.4 Verificar que GET endpoints de ingredientes sean accesibles por cualquier usuario autenticado

## 5. Frontend — Componentes Shared UI

- [x] 5.1 Crear componente `DataTable` en `src/shared/ui/DataTable.tsx` con paginación y estados vacíos
- [x] 5.2 Crear componente `ConfirmDialog` en `src/shared/ui/ConfirmDialog.tsx` con botones Cancelar/Confirmar
- [x] 5.3 Crear componente `Toast` en `src/shared/ui/Toast.tsx` con variantes success/error/warning
- [x] 5.4 Crear componente `FormField` en `src/shared/ui/FormField.tsx` con tipos text, select, checkbox
- [x] 5.5 Crear componente `ProtectedRoute` en `src/shared/utils/ProtectedRoute.tsx` con verificación RBAC y redirección

## 6. Frontend — API Hooks de Categorías

- [x] 6.1 Crear `src/entities/api/categorias.ts` con tipos TypeScript para CategoriaCreate, CategoriaUpdate, CategoriaRead, CategoriaTreeNode
- [x] 6.2 Crear `src/features/admin/api/categorias.ts` con hooks TanStack Query: useCategoryTree, useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory
- [x] 6.3 Implementar invalidación automática de cache al mutar categorías

## 7. Frontend — API Hooks de Ingredientes

- [x] 7.1 Crear `src/entities/api/ingredientes.ts` con tipos TypeScript para IngredienteCreate, IngredienteUpdate, IngredienteRead
- [x] 7.2 Crear `src/features/admin/api/ingredientes.ts` con hooks TanStack Query: useIngredients, useCreateIngredient, useUpdateIngredient, useDeleteIngredient
- [x] 7.3 Implementar invalidación automática de cache al mutar ingredientes

## 8. Frontend — Página de Administración de Categorías

- [x] 8.1 Crear `src/pages/admin/CategoriesAdmin.tsx` con layout de página y protección RBAC
- [x] 8.2 Crear `src/widgets/admin/CategoryTree.tsx` — componente de árbol jerárquico colapsable con useCategoryTree
- [x] 8.3 Crear `src/widgets/admin/CategoryForm.tsx` — formulario modal para crear/editar categoría con validación de padre (excluyendo self y descendientes)
- [x] 8.4 Crear `src/widgets/admin/CategoryDeleteConfirm.tsx` — confirmación de eliminación con mensaje de error si tiene subcategorías activas
- [ ] 8.5 Configurar ruta `/admin/categorias` en el router con ProtectedRoute(requireRole: ["ADMIN", "STOCK"])

## 9. Frontend — Página de Administración de Ingredientes

- [x] 9.1 Crear `src/pages/admin/IngredientsAdmin.tsx` con layout de página y protección RBAC
- [x] 9.2 Crear `src/widgets/admin/IngredientTable.tsx` — tabla paginada con filtro de alérgenos
- [x] 9.3 Crear `src/widgets/admin/IngredientForm.tsx` — formulario modal para crear/editar ingrediente (nombre + es_alergeno)
- [x] 9.4 Crear `src/widgets/admin/IngredientDeleteConfirm.tsx` — confirmación de eliminación de ingrediente
- [ ] 9.5 Configurar ruta `/admin/ingredientes` en el router con ProtectedRoute(requireRole: ["ADMIN", "STOCK"])

## 10. Integración y Verificación

- [x] 10.1 Verificar que el backend arranca correctamente con todos los endpoints de categorías e ingredientes
- [ ] 10.2 Verificar que `GET /categorias/tree` retorna la jerarquía anidada correcta
- [ ] 10.3 Verificar que `PUT /categorias/{id}` con padre_id inválido (ciclo) retorna 409
- [ ] 10.4 Verificar que `DELETE /categorias/{id}` con subcategorías activas retorna 409
- [ ] 10.5 Verificar que STOCK puede escribir en categorías e ingredientes, CLIENT obtiene 403
- [x] 10.6 Verificar que el frontend compila sin errores (`npm run build`)
- [ ] 10.7 Verificar rutas protegidas: CLIENT redirigido a login/403, ADMIN y STOCK acceden correctamente