# Design — Sprint 3: Productos + Perfil del Cliente

## Context

Sprint 1 (Auth + Navegación) y Sprint 2 (Categorías + Ingredientes) están completos. El backend tiene:

- **Auth funcional**: register, login, refresh, logout, me, RBAC con 4 roles
- **Categorías funcional**: CRUD completo con árbol jerárquico (CTE recursivo)
- **Ingredientes funcional**: CRUD completo con flag es_alergeno y soft delete
- **Productos parcial**: CRUD básico (create, list, get, update, toggle_disponibilidad, delete) pero **sin relaciones M2M**, sin catálogo público con filtros, sin gestión de stock atómica
- **Modelos existentes en all_models.py**: Producto, ProductoCategoria, ProductoIngrediente — las tablas ya existen en la BD
- **Frontend**: auth completo, navbar por rol, CRUD admin de categorías/ingredientes, pero sin catálogo de productos ni perfil

Los modelos `ProductoCategoria` y `ProductoIngrediente` ya están definidos con sus FKs, pero **no hay endpoints ni service methods** que los usen.

## Goals / Non-Goals

**Goals:**

- Completar el módulo de productos con todas las relaciones M2M y endpoints faltantes
- Crear el módulo de perfil del cliente (ver, editar, cambiar contraseña)
- Crear el frontend de catálogo público y admin de productos
- Crear el frontend de perfil del cliente

**Non-Goals:**

- Sprint 4+ (Direcciones, Carrito, Pedidos, Pagos, etc.)
- Implementar el carrito de compras
- Dashboard de métricas admin
- Webhooks de MercadoPago
- Tests E2E (se cubrirá en el bonus de testing al final)

## Decisions

### 1. Arquitectura Backend — Feature-First (ya establecida)

Se mantiene el patrón Feature-First del proyecto. Cada módulo en su carpeta con:

```
modulo/
├── model.py       ← (productos ya importa de all_models)
├── schemas.py     ← Pydantic schemas (Create/Update/Read)
├── repository.py  ← Hereda BaseRepository[T], métodos custom
├── service.py     ← Stateless, recibe UnitOfWork
└── router.py      ← Endpoints HTTP, validación, delega al service
```

Flujo: Router → Service → UnitOfWork → Repository → Model

### 2. Productos — Relaciones M2M

**Decisión**: Los endpoints de asociación (US-016, US-017) usan `PUT` que **reemplaza** todas las asociaciones del producto. No se usan endpoints granulares tipo `POST /productos/:id/categorias/:catId` porque:

- Simplifica el frontend (una sola request con array completo)
- Evita inconsistencias parciales
- El patrón de "enviar todo el estado y el backend lo sincroniza" es más seguro

**Alternativa descartada**: Endpoints granulares POST/DELETE por relación — más verbosos, requieren manejo de errores por item, no aportan valor real.

### 3. Productos — Catálogo Público (US-018)

**Decisión**: El endpoint `GET /api/v1/productos` será el mismo endpoint existente, pero **mejorado** con filtros avanzados. Se distingue entre usuario autenticado y anónimo:

- **Sin auth** (público): solo productos disponibles y no eliminados, sin mostrar stock exacto
- **Autenticado (STOCK/ADMIN)**: puede ver todos los productos, incluyendo eliminados con `?incluir_eliminados=true`

**Schema de respuesta del listado público**: `ProductoCatalogoRead` con campos limitados (id, nombre, precio_base, imagen, disponible, categorias nombres). No expone `stock_cantidad` directamente — solo `disponible` booleano.

**Schema de respuesta del detalle (US-019)**: `ProductoDetalleRead` con todo + ingredientes con flag `es_alergeno` + categorías + `hay_stock` booleano (stock > 0 sin revelar cantidad).

### 4. Productos — Filtro de Alérgenos (US-023)

**Decisión**: Se implementa como query param en el mismo endpoint de listado: `?excluirAlergenos=1,3,7`. La consulta usa `NOT EXISTS` sobre `ProductoIngrediente` para excluir productos que contengan ANY de los ingredientes alérgenos listados.

**Alternativa descartada**: Endpoint separado para filtro de alérgenos — innecesario, agrega complejidad sin beneficio.

### 5. Productos — Gestión de Stock (US-021)

**Decisión**: Endpoint `PATCH /api/v1/productos/:id/stock` con body:

```json
{ "cantidad": 10, "tipo": "incremento" }   // Suma 10 al stock actual
{ "cantidad": 50, "tipo": "absoluto" }      // Setea stock en 50
```

Se usa `UPDATE ... SET stock_cantidad = stock_cantidad + :delta WHERE id = :id AND stock_cantidad + :delta >= 0` para garantizar atomicidad y que el stock nunca sea negativo.

### 6. Productos — Soft Delete (US-022)

**Decisión**: El endpoint `DELETE` ya existe pero hace borrado físico. Se modifica para hacer soft delete: setear `eliminado_en = now()`. El `repository.get_by_id` y los listados ya filtran `eliminado_en IS NULL`.

Se agrega parámetro `?incluir_eliminados=true` para ADMIN/STOCK que necesiten ver productos eliminados.

### 7. Perfil — Módulo Nuevo

**Decisión**: Se crea `app/modules/perfil/` con router, service, schemas. **No necesita repository propio** — usa `uow.usuarios` existente porque el perfil ES el usuario autenticado.

Endpoints:
- `GET /api/v1/perfil` → lee usuario del JWT, retorna datos del usuario
- `PUT /api/v1/perfil` → actualiza nombre y teléfono (email NO modificable)
- `PUT /api/v1/perfil/password` → valida contraseña actual, hashea nueva, invalida refresh tokens

**Validación de contraseña** (US-063):
1. Verificar `bcrypt.verify(password_actual, usuario.password_hash)`
2. Hashear nueva contraseña con `bcrypt.hash(password_nueva, cost=12)`
3. Actualizar `usuario.password_hash`
4. Revocar TODOS los refresh tokens del usuario (forzar re-login)

### 8. Frontend — Catálogo de Productos

**Estructura FSD**:

```
frontend/src/
├── entities/api/
│   └── productosApi.ts    ← TanStack Query hooks para productos
├── features/catalogo/
│   ├── components/
│   │   ├── ProductGrid.tsx       ← US-018: Grid responsive de productos
│   │   ├── ProductCard.tsx       ← US-018: Card de producto
│   │   ├── ProductFilters.tsx    ← US-018: Filtros (categoría, búsqueda, alérgenos)
│   │   ├── ProductDetail.tsx    ← US-019: Detalle con ingredientes
│   │   └── AllergenFilter.tsx   ← US-023: Checkboxes de alérgenos
├── features/stock/
│   ├── components/
│   │   ├── ProductForm.tsx       ← Crear/editar producto
│   │   ├── ProductCategorySelect.tsx  ← US-016: Asociar categorías
│   │   ├── ProductIngredientSelect.tsx ← US-017: Asociar ingredientes
│   │   └── StockManager.tsx      ← US-021: Gestión de stock
├── features/profile/
│   ├── components/
│   │   ├── ProfileView.tsx       ← US-061: Ver perfil
│   │   ├── ProfileEditForm.tsx   ← US-062: Editar nombre/teléfono
│   │   └── PasswordChangeForm.tsx ← US-063: Cambio de contraseña
├── pages/
│   ├── CatalogPage.tsx           ← Ruta pública /
│   ├── ProductDetailPage.tsx     ← Ruta pública /productos/:id
│   ├── ProfilePage.tsx           ← Reemplaza placeholder actual
│   └── stock/
│       ├── ProductListPage.tsx   ← Admin: lista de productos
│       ├── ProductCreatePage.tsx ← Admin: crear producto
│       └── ProductEditPage.tsx   ← Admin: editar producto
```

### 9. Frontend — Perfil del Cliente

**Nuevos hooks en profileApi.ts**:

```typescript
useProfile()          → query GET /perfil
useUpdateProfile()    → mutation PUT /perfil
useChangePassword()   → mutation PUT /perfil/password
```

Flujo de cambio de contraseña:
1. Formulario: contraseña actual + nueva + confirmación
2. Si exitoso → invalidar authStore, redirigir a /login con toast "Contraseña actualizada. Iniciá sesión nuevamente."
3. Si error → toast con mensaje (contraseña actual incorrecta)

## Risks / Trade-offs

- **[Riesgo] El módulo de productos ya existe parcialmente** → Se modifica el código existente (repository, service, router, schemas) en vez de crear desde cero. Hay que tener cuidado de no romper endpoints existentes.
- **[Riesgo] M2M sync puede causar inconsistencias** → El patrón "reemplazo completo" (PUT con array) es más seguro que endpoints granulares, pero require que el frontend envíe siempre el estado completo.
- **[Trade-off] Exponer stock solo como booleano `hay_stock`** → No muestra cantidad exacta por seguridad (RN-PE no revelar cantidad), pero el admin/stock sí necesita ver la cantidad absoluta. Se diferencia por rol en el schema de respuesta.
- **[Riesgo] Cambio de contraseña invalida todos los dispositivos** → Al revocar todos los refresh tokens, el usuario se desloguea de todos lados. Es la decisión correcta de seguridad (RN-AU05), pero podría confundir si el usuario cambia desde un dispositivo mientras usa otro.

## Open Questions

- ¿El catálogo público necesita paginación con cursor o offset/limit es suficiente para MVP? → Offset/limit es suficiente para MVP (la BD no tendrá millones de productos inicialmente).
- ¿Se necesita migración de Alembic para ProductoCategoria/ProductoIngrediente? → No, las tablas ya existen por el seed de Sprint 0.