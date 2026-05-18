/** IngredientTable — Tabla de ingredientes con filtro de alérgenos. */
import { useMemo, useState } from 'react'
import { DataTable, type Column } from '@shared/ui/DataTable'
import { useIngredients } from '@features/admin/api/ingredientes'
import type { IngredienteRead } from '@entities/api/ingredientes'

interface IngredientTableProps {
  onEdit: (ingredient: IngredienteRead) => void
  onDelete: (ingredient: IngredienteRead) => void
}

const PAGE_SIZE = 20

export function IngredientTable({ onEdit, onDelete }: IngredientTableProps) {
  const [alergenoOnly, setAlergenoOnly] = useState(false)
  const [page, setPage] = useState(1)

  // Cargamos hasta 100 ingredientes (límite del backend) y paginamos en cliente.
  // Si en el futuro hubiera más, mover paginación a server-side.
  const { data: ingredients = [], isLoading } = useIngredients({
    alergeno: alergenoOnly || undefined,
    offset: 0,
    limit: 100,
  })

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return ingredients.slice(start, start + PAGE_SIZE)
  }, [ingredients, page])

  const columns: Column<IngredienteRead>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (row) => (
        <span className="font-medium text-stone-900">{row.nombre}</span>
      ),
    },
    {
      key: 'es_alergeno',
      label: 'Alérgeno',
      render: (row) =>
        row.es_alergeno ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            Sí
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600">
            No
          </span>
        ),
    },
    {
      key: 'created_at',
      label: 'Creado',
      render: (row) =>
        new Date(row.created_at).toLocaleDateString('es-AR'),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="text-sm text-blue-600 hover:underline"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(row)}
            className="text-sm text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Filter toggle */}
      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={alergenoOnly}
            onChange={(e) => {
              setAlergenoOnly(e.target.checked)
              setPage(1)
            }}
            className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-brand-500"
          />
          <span className="text-sm text-stone-600">Solo alérgenos</span>
        </label>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-stone-400">Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={paginated}
          total={ingredients.length}
          page={page}
          limit={PAGE_SIZE}
          onPageChange={setPage}
          emptyMessage="No hay ingredientes para mostrar"
        />
      )}
    </div>
  )
}
