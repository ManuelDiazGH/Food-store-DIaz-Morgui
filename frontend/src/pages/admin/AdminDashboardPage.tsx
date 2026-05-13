export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">📊 Dashboard Admin</h1>
      <p className="text-gray-500 mb-8">Estadísticas del sistema — próximamente</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '👥', label: 'Usuarios', desc: 'Próximamente' },
          { icon: '📦', label: 'Pedidos', desc: 'Próximamente' },
          { icon: '🍕', label: 'Productos', desc: 'Próximamente' },
          { icon: '💰', label: 'Ventas', desc: 'Próximamente' },
        ].map((card) => (
          <div key={card.icon} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <span className="text-3xl">{card.icon}</span>
            <h3 className="font-semibold text-gray-900 mt-2">{card.label}</h3>
            <p className="text-sm text-gray-400">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}