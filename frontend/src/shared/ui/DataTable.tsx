/** DataTable — Reusable paginated table. Minimalist. */
import type { ReactNode } from 'react'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  total?: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  total = 0,
  page,
  limit,
  onPageChange,
  emptyMessage = 'No hay datos para mostrar',
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-stone-100">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-stone-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-stone-50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-4 py-3 text-sm text-stone-700 whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
          <p className="text-sm text-stone-500">
            Mostrando {(page - 1) * limit + 1} a{' '}
            {Math.min(page * limit, total)} de {total} resultados
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 text-sm rounded-lg border border-stone-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-stone-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 text-sm rounded-lg border border-stone-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
