## 1. Delivery Addresses — API Layer

- [x] 1.1 Create `entities/api/direccionesApi.ts` with TanStack Query hooks: `useDirecciones`, `useCreateDireccion`, `useUpdateDireccion`, `useSetPrincipal`, `useDeleteDireccion`
- [x] 1.2 Configure query keys and invalidations for direcciones queries

## 2. Delivery Addresses — Components

- [x] 2.1 Create `features/direcciones/components/DireccionCard.tsx` — card showing address details (alias, address, city, cp), default badge, and action buttons (edit, delete, set as default)
- [x] 2.2 Create `features/direcciones/components/DireccionForm.tsx` — form for creating/editing addresses with fields: alias, linea1, linea2, ciudad, cp
- [x] 2.3 Create `features/direcciones/index.ts` barrel export

## 3. Delivery Addresses — Page

- [x] 3.1 Create `pages/DireccionesPage.tsx` — page with address list, create button, modal for DireccionForm, inline edit, delete confirmation, set-default action
- [x] 3.2 Register `/addresses` route in `AppRouter.tsx` pointing to DireccionesPage (already configured under ProtectedRoute)
- [x] 3.3 Verify navbar link "Mis Direcciones" already points to `/addresses` (already in CLIENT_ITEMS)

## 4. Shopping Cart — Add-to-Cart with Ingredient Exclusion

- [x] 4.1 Update `ProductDetail.tsx` to add quantity selector (+/- buttons, min 1)
- [x] 4.2 Update `ProductDetail.tsx` to show ingredient exclusions: only `es_removible` ingredients get checkboxes, non-removable shown as read-only
- [x] 4.3 Add "Agregar al carrito" button to `ProductDetail.tsx` that calls `useCartStore.addItem(producto, cantidad, exclusiones)` with selected exclusions
- [x] 4.4 Show feedback/confirmation when item is added to cart (e.g., toast notification or badge increment)

## 5. Shopping Cart — CartDrawer

- [x] 5.1 Create `features/cart/components/CartDrawer.tsx` — slide-out drawer from right (w-96 desktop, full mobile) with overlay backdrop
- [x] 5.2 Implement drawer content: list of items (name, quantity, unit price, exclusions text, subtotal), empty state with link to catalog
- [x] 5.3 Add drawer footer: total price + "Ir al carrito" button that navigates to `/cart` and closes drawer
- [x] 5.4 Wire CartDrawer into `Layout.tsx` so it's globally available (use `useCartStore.isOpen` / `toggleCart`)

## 6. Shopping Cart — CartPage

- [x] 6.1 Replace `pages/CartPage.tsx` placeholder with full cart page:
  - Item list: image, name, quantity controls (+/-), exclusion labels, subtotal
  - Remove button per item
- [x] 6.2 Add order summary sidebar: subtotal, total, disabled "Proceder al checkout" button (Sprint 5+)
- [x] 6.3 Add "Vaciar carrito" button with confirmation modal (clearCart confirmation dialog)
- [x] 6.4 Handle empty cart state: message + link to catalog

## 7. Shopping Cart — Navbar Badge

- [x] 7.1 Add cart item count badge to the "Mi Carrito" NavItem in Navbar.tsx using `useCartStore.totalItems()`
- [x] 7.2 Badge only shows when `totalItems() > 0`, positioned near the cart icon
