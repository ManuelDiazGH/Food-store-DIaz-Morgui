import { useAuthStore } from '@features/auth/store/authStore'
import { useMe } from '@entities/api/authApi'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: meData } = useMe()
  const displayName = meData?.nombre ?? user?.nombre ?? 'Usuario'

  const cards = [
    { label: 'Mis Pedidos', desc: 'Ver historial de pedidos', to: '/orders' },
    { label: 'Mi Carrito', desc: 'Productos seleccionados', to: '/cart' },
    { label: 'Mis Direcciones', desc: 'Gestionar direcciones de entrega', to: '/addresses' },
    { label: 'Mi Perfil', desc: 'Editar datos personales', to: '/profile' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">
          Hola, {displayName}
        </h1>
        <p className="text-stone-600 mt-1">¿Qué querés hacer hoy?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <a
            key={card.to}
            href={card.to}
            className="block rounded-xl bg-white p-6 shadow-sm hover:shadow-md hover:ring-2 hover:ring-brand-200 transition-all"
          >
            <h3 className="font-semibold text-stone-900">{card.label}</h3>
            <p className="text-sm text-stone-500 mt-1">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}