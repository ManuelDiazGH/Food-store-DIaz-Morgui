/** CategoryTree — Collapsible hierarchical tree of categories. */
import { useState } from 'react'
import type { CategoriaTreeNode } from '@entities/api/categorias'

interface CategoryTreeProps {
  tree: CategoriaTreeNode[]
  selectedId?: number | null
  onSelect: (id: number | null) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

function TreeNode({
  node,
  depth = 0,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  node: CategoriaTreeNode
  depth?: number
  selectedId?: number | null
  onSelect: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.subcategorias && node.subcategorias.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer hover:bg-stone-100 ${
          isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="w-5 h-5 flex items-center justify-center text-stone-400 hover:text-stone-600"
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span className="flex-1 text-sm text-stone-800 truncate">
          {node.nombre}
        </span>

        {/* Action buttons on hover */}
        <div className="hidden group-hover:flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(node.id)
            }}
            className="text-xs text-blue-600 hover:underline"
            title="Editar"
          >
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.id)
            }}
            className="text-xs text-red-500 hover:underline"
            title="Eliminar"
          >
            Eliminar
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.subcategorias.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoryTree({
  tree,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  if (tree.length === 0) {
    return (
      <div className="text-center text-stone-400 py-8">
        No hay categorías. Creá la primera.
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}