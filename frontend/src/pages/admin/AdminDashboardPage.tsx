import { useState } from 'react'
import { useDashboardMetrics, useVentasPorPeriodo, useTopProductos, usePedidosPorEstado } from '@entities/api/adminApi'
import { Spinner } from '@shared/ui/Spinner'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: '#FBBF24',
  CONFIRMADO: '#3B82F6',
  EN_PREPARACION: '#8B5CF6',
  EN_CAMINO: '#F97316',
  ENTREGADO: '#22C55E',
  CANCELADO: '#EF4444',
}

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PREPARACION: 'En Preparación',
  EN_CAMINO: 'En Camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

export default function AdminDashboardPage() {
  const [granularidad, setGranularidad] = useState('dia')
  const [desde, setDesde] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [hasta, setHasta] = useState(() => new Date().toISOString().split('T')[0])

  const metrics = useDashboardMetrics(desde, hasta)
  const ventas = useVentasPorPeriodo(desde, hasta, granularidad)
  const topProductos = useTopProductos(10, desde, hasta)
  const pedidosEstado = usePedidosPorEstado(desde, hasta)

  // Solo bloqueamos en el primer load. En refetches por cambio de filtro,
  // mostramos la data anterior para evitar un spinner full-page que tape todo.
  const initialLoading =
    (metrics.isLoading && !metrics.data) ||
    (ventas.isLoading && !ventas.data) ||
    (topProductos.isLoading && !topProductos.data) ||
    (pedidosEstado.isLoading && !pedidosEstado.data)

  if (initialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const m = metrics.data
  const ventasData = ventas.data ?? []
  const topData = topProductos.data ?? []
  const estadoData = pedidosEstado.data ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Dashboard Administrativo</h1>

      {/* Metric cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Clientes</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{m?.total_usuarios ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Pedidos</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{m?.total_pedidos ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Productos</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{m?.total_productos ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Ventas totales</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">
            {formatCurrency(m?.total_ventas ?? 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-stone-600">Desde:</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-stone-600">Hasta:</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-stone-600">Granularidad:</label>
          <select
            value={granularidad}
            onChange={(e) => setGranularidad(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
          </select>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line chart — ventas */}
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-stone-900">Ventas por período</h3>
          {ventasData.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">Sin datos de ventas</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="monto" stroke="#F97316" strokeWidth={2} name="Ventas" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart — top productos */}
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-stone-900">Top 10 productos</h3>
          {topData.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">Sin datos de productos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => value} />
                <Legend />
                <Bar dataKey="cantidad_vendida" fill="#3B82F6" name="Cantidad vendida" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — estados */}
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-stone-900">Pedidos por estado</h3>
          {estadoData.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">Sin datos de pedidos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadoData.map((e) => ({ ...e, name: ESTADO_LABELS[e.estado] ?? e.estado }))}
                  dataKey="cantidad"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, cantidad }: { name: string; cantidad: number }) => `${name}: ${cantidad}`}
                >
                  {estadoData.map((entry) => (
                    <Cell key={entry.estado} fill={ESTADO_COLORS[entry.estado] ?? '#9CA3AF'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary table */}
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-stone-900">Resumen de métricas</h3>
          {estadoData.length === 0 && ventasData.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">Sin datos</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-sm text-stone-600">Clientes activos</span>
                <span className="font-semibold">{m?.total_usuarios ?? 0}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-sm text-stone-600">Pedidos totales</span>
                <span className="font-semibold">{m?.total_pedidos ?? 0}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-sm text-stone-600">Productos en catálogo</span>
                <span className="font-semibold">{m?.total_productos ?? 0}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-sm text-stone-600">Ventas totales</span>
                <span className="font-semibold">{formatCurrency(m?.total_ventas ?? 0)}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-sm text-stone-600">Productos en top 10</span>
                <span className="font-semibold">{topData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-stone-600">Período de datos</span>
                <span className="font-semibold">{desde} a {hasta}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
