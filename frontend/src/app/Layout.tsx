import { Outlet } from 'react-router-dom'
import { Navbar } from '@widgets/Navbar'
import { CartDrawer } from '@features/cart'

export function Layout() {
  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-stone-100 py-6 text-center text-sm text-stone-400">
        &copy; 2026 Food Store &mdash; E-commerce de alimentos
      </footer>
      <CartDrawer />
    </div>
  )
}
