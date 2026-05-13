# Proposal — Sprint 3: Productos + Perfil del Cliente

## Why

Sprint 1 (Auth y Navegación) y Sprint 2 (Categorías e Ingredientes) están implementados. El backend tiene módulos funcionales de auth, categorías e ingredientes, y el frontend tiene login, registro, navbar por rol y CRUD de categorías/ingredientes.

Sin embargo, el módulo de **productos** está incompleto: el backend tiene un CRUD básico (create, list, get, update, toggle_disponibilidad, delete) pero **le faltan** las relaciones M2M con categorías e ingredientes (US-016, US-017), el catálogo público con filtros (US-018), el detalle enriquecido (US-019), la gestión de stock atómica (US-021), el filtro por alérgenos (US-023), y el soft delete correcto (US-022). Tampoco existe el módulo de **perfil del cliente** (US-061, US-062, US-063).

El frontend **no tiene** ninguna página de catálogo de productos ni de perfil. Las páginas `ProfilePage.tsx` y `HomePage.tsx` son placeholders vacíos.

Este sprint completa las dos piezas faltantes: el catálogo de productos (core del e-commerce) y el perfil del cliente (gestión de datos personales).

## What Changes

### Backend — Productos (completar módulo existente)

- **US-016**: Endpoint `PUT /api/v1/productos/:id/categorias` para asociar/desasociar categorías M2M
- **US-017**: Endpoint `PUT /api/v1/productos/:id/ingredientes` para asociar/desasociar ingredientes M2M (con flag es_removible)
- **US-018**: Endpoint `GET /api/v1/productos` mejorado con filtros (`?categoria=X&busqueda=Y&page=N&limit=M&excluirAlergenos=1,3,7`) — público, solo disponibles y no eliminados
- **US-019**: Endpoint `GET /api/v1/productos/:id` mejorado para incluir categorías, ingredientes y alérgenos destacados
- **US-020**: Endpoint `PUT /api/v1/productos/:id` ya existe, verificar validaciones (precio > 0, 2 decimales, stock >= 0)
- **US-021**: Endpoint `PATCH /api/v1/productos/:id/stock` — actualización atómica de stock (incremento o seteo absoluto)
- **US-022**: Soft delete correcto — `DELETE /api/v1/productos/:id` marca `eliminado_en` sin borrar físicamente
- **US-023**: Filtro de alérgenos en el endpoint de listado (`?excluirAlergenos=1,3,7`)

### Backend — Perfil del Cliente (módulo nuevo)

- **US-061**: Endpoint `GET /api/v1/perfil` — ver perfil propio (nombre, email, teléfono, fecha registro)
- **US-062**: Endpoint `PUT /api/v1/perfil` — editar nombre y teléfono (email no modificable)
- **US-063**: Endpoint `PUT /api/v1/perfil/password` — cambiar contraseña (validar actual, hashear nueva, invalidar refresh tokens)

### Frontend — Catálogo de Productos

- Página pública de catálogo con grilla de productos, paginación, filtro por categoría, búsqueda
- Página de detalle de producto con ingredientes y alérgenos destacados
- Filtro de exclusión de alérgenos con checkboxes
- Páginas admin/stock para CRUD de productos, asociación de categorías e ingredientes

### Frontend — Perfil del Cliente

- Página de perfil con datos del usuario (nombre, email, teléfono, fecha registro)
- Formulario de edición de nombre y teléfono (email readonly)
- Formulario de cambio de contraseña (actual + nueva + confirmación)

## Capabilities

### New Capabilities

- `productos-backend`: CRUD completo de productos con relaciones M2M (categorías, ingredientes), catálogo público con filtros y paginación, gestión de stock atómica, soft delete, filtro de alérgenos
- `productos-catalogo-frontend`: Catálogo público con grilla, filtros, búsqueda, detalle enriquecido con alérgenos, y admin CRUD
- `perfil-backend`: Ver, editar perfil del cliente y cambiar contraseña
- `perfil-frontend`: Páginas de visualización y edición de perfil, cambio de contraseña

### Modified Capabilities

- `categorias-backend`: No cambia comportamiento, pero el endpoint de productos filtra por categoría (se consulta ProductoCategoria)
- `ingredientes-backend`: No cambia comportamiento, pero el endpoint de productos consulta ProductoIngrediente (relación existente en modelo)

## Impact

- **Backend**: Módulo `productos/` se expande significativamente (5 endpoints nuevos/modificados). Nuevo módulo `perfil/`. Modelos ProductoCategoria y ProductoIngrediente ya existen en `all_models.py`.
- **Frontend**: Nueva feature `features/catalogo/`, nueva feature `features/profile/`, páginas nuevas en `pages/`. Actualizar router con nuevas rutas.
- **DB**: No se necesitan migraciones nuevas — los modelos ProductoCategoria y ProductoIngrediente ya existen y las tablas ya se crearon en Sprint 0.
- **Dependencias**: Sprint 1 (auth) y Sprint 2 (categorías + ingredientes) deben estar completos.