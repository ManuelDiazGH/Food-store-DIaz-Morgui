## Context

El backend ya cuenta con módulos funcionales de **Categorías** e **Ingredientes** implementados en Sprint 0 (US-000f), con CRUD básico endpoints, schemas, services y repositories. Sin embargo, varias funcionalidades requeridas por las historias de usuario US-007 a US-014 están incompletas o ausentes:

- **Categorías**: El listado actual es flat (sin árbol jerárquico CTE), no hay validación de ciclos en `padre_id`, el soft delete no maneja subcategorías huérfanas, y el rol STOCK no tiene acceso a los endpoints de escritura.
- **Ingredientes**: El módulo está funcionalmente completo, solo requiere ajuste de permisos (STOCK puede gestionar ingredientes).
- **Frontend**: No existe ninguna interfaz de administración para categorías ni ingredientes.

El patrón arquitectónico ya está establecido: **Router → Service → UoW → Repository → Model** con feature-first folder structure.

## Goals / Non-Goals

**Goals:**
- Completar US-007 a US-014: gestión completa de categorías jerárquicas e ingredientes con alérgenos
- Agregar endpoint CTE recursivo para árbol de categorías (US-008)
- Implementar validación de ciclos en jerarquía de categorías (US-009)
- Implementar validación de subcategorías huérfanas en soft delete (US-010)
- Agregar rol STOCK a endpoints de escritura de categorías e ingredientes (RN-RB06)
- Crear páginas de administración frontend para categorías e ingredientes
- Crear componentes UI compartidos para administración (DataTable, ConfirmDialog, Toast, RBAC guards)

**Non-Goals:**
- Implementación de Sprint 3 (Productos, US-015+) — se abordará en otro change
- Integración MercadoPago o flujo de pagos
- Dashboard de métricas o gráficos
- Sistema de notificaciones
- Tests E2E (se cubrirán en otro change)

## Decisions

### D1: CTE Recursivo en PostgreSQL para árbol de categorías

**Decisión**: Usar SQL CTE recursivo (`WITH RECURSIVE`) en el repository en vez de cargar todas las categorías y armar el árbol en Python.

**Razón**: Con CTE, la base de datos hace el trabajo en una sola query evitando N+1. Para un e-commerce con ~50-100 categorías, la diferencia es mínima, pero CTE es la solución correcta para jerarquías arbitrarias, es la aproximación que indica la documentación del proyecto, y escala sin cambios si la profundidad crece.

**Alternativa considerada**: Cargar todas las categorías flat y construir el árbol con un dict en Python. Más simple pero requiere iterar en memoria y no aprovecha el motor de BD.

### D2: Validación de ciclos con CTE antes de persistir `padre_id`

**Decisión**: Al actualizar `padre_id`, ejecutar una CTE recursiva que trace los ancestros del nuevo padre. Si el ID de la categoría aparece en la cadena de ancestros → ciclo detectado → rechazar.

**Razón**: PostgreSQL no tiene constraint nativo para ciclos en FK autoreferencial. La CTE es O(profundidad), siendo la profundidad máxima muy baja (3-4 niveles en un e-commerce de alimentos). Se hace en la misma transacción que el update.

### D3: Soft delete de categorías con subcategorías

**Decisión**: Al hacer soft delete de una categoría padre, **rechazar** si tiene subcategorías activas. El usuario debe reasignar o eliminar las subcategorías primero.

**Razón**: La especificación (US-010) dice "Las subcategorias de una categoria eliminada deben reasignarse o eliminarse previamente". Una categoría eliminada aparece como `eliminado_en IS NOT NULL`, lo cual rompería la jerarquía si tiene hijos activos apuntando a un padre eliminado. Forzar la reasignación explícita evita huérfanos silenciosos.

### D4: Permiso STOCK en endpoints de escritura

**Decisión**: Cambiar `Depends(require_role("ADMIN"))` a `Depends(require_role("ADMIN", "STOCK"))` en los endpoints de escritura de categorías e ingredientes.

**Razón**: RN-RB06 establece que el Gestor de Stock gestiona productos, ingredientes, alérgenos, stock y categorías. Los endpoints de lectura permanecen públicos para categorías (catálogo) y accesibles a cualquier rol autenticado para ingredientes.

### D5: Estructura frontend — Feature-Sliced Design

**Decisión**: Seguir la arquitectura FSD ya establecida:
- `features/admin/` — Stores, hooks, API calls para administración
- `widgets/admin/` — Componentes compuestos (CategoryTree, IngredientTable)
- `pages/admin/` — Páginas de ruta
- `shared/ui/` — Componentes genéricos (DataTable, ConfirmDialog, Toast)
- `shared/utils/` — Guards RBAC

**Razón**: Consistencia con la arquitectura documentada en AGENTS.md e Integrador.txt. No introducir patrones nuevos.

### D6: Guard RBAC en frontend con HOC `withAuth`

**Decisión**: Crear un `ProtectedRoute` component y un hook `useRequireRole()` que verifique los roles del usuario contra los permitidos para la ruta, redirigiendo a `/login` o mostrando 403 según corresponda.

**Razón**: La especificación (US-076) requiere protección de rutas frontend por rol. Un HOC/wrapper es el patrón estándar en React Router v6.

### D7: Schemas de respuesta para árbol jerárquico

**Decisión**: Crear un schema `CategoriaTreeNode` que extienda `CategoriaRead` con un campo `subcategorias: list[CategoriaTreeNode]` recursivo, para modelar el árbol anidado.

**Razón**: El endpoint de árbol necesita una estructura diferente al listado flat. Mantener `CategoriaRead` para el endpoint flat y crear `CategoriaTreeNode` para el árbol evita romper la API existente.

## Risks / Trade-offs

- **[CTE performance en producción]** → Para ~50-100 categorías el CTE es instantáneo. Si el catálogo crece a miles, se puede agregar caché en el endpoint `/tree` conTanStack Query en el frontend (staleTime alto). Mitigación: el endpoint ya es público y cacheable.

- **[Validación de ciclos en update de padre]** → La CTE agrega una query extra por cada update de `padre_id`. Es negligable dado que los updates de jerarquía son eventos raros (admin los hace manualmente, no en cada request).

- **[Soft delete de categoría padre con subcategorías]** → Se elegió rechazar en vez de cascade silencioso. Esto fuerza al usuario a ser explícito, lo cual es más seguro pero requiere un paso manual extra. Mitigación: el frontend debe mostrar un mensaje claro indicando qué subcategorías están bloqueando la eliminación.

- **[Rol STOCK puede crear categorías e ingredientes]** →GENER poder crear pero no poder eliminar subcategorías con productos hijos. El service ya valida esto, pero hay que asegurar que el frontend muestre el error adecuadamente.

- **[Frontend sin diseño visual definido]** → No hay mockups en la documentación. Se usará Tailwind CSS con un diseño funcional minimalistica. Los componentes se pueden refinar visualmente después.