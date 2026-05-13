import type { OrderFilters } from '@entities/api/pedidosApi'

interface OrderSearchBarProps {
  filters: OrderFilters
  onChange: (filters: OrderFilters) => void
}

const ALL_STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'EN_PREPARACION', label: 'En preparación' },
  { value: 'EN_CAMINO', label: 'En camino' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export function OrderSearchBar({ filters, onChange }: OrderSearchBarProps) {
  function handleChange(partial: Partial<OrderFilters>) {
    onChange({ ...filters, ...partial, page: 1 })
  }

  function handleClear() {
    onChange({})
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
        <input
          type="text"
          value={filters.q ?? ''}
          onChange={(e) => handleChange({ q: e.target.value })}
          placeholder="Buscar por #pedido o cliente..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
        <input
          type="date"
          value={filters.desde ?? ''}
          onChange={(e) => handleChange({ desde: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
        <input
          type="date"
          value={filters.hasta ?? ''}
          onChange={(e) => handleChange({ hasta: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
        <select
          value={filters.estado ?? ''}
          onChange={(e) => handleChange({ estado: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
        >
          {ALL_STATUSES.map((st) => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleClear}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Limpiar
      </button>
    </div>
  )
}
