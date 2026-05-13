import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import type { Usuario } from '@entities/types'
import { useRemoveUser } from '@features/admin/hooks/useUserMutations'
import { RoleBadge } from '@features/admin/components/RoleBadge'
import { AssignRoleDialog } from '@features/admin/components/AssignRoleDialog'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Spinner } from '@shared/ui/Spinner'
import { useToast } from '@shared/ui/Toast'
import { getErrorMessage } from '@shared/utils/errorHandler'

const PAGE_SIZE = 10

async function fetchUsers(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/api/v1/usuarios')
  return data
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface ConfirmDialogProps {
  userName: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function ConfirmDialog({ userName, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Confirmar eliminación
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          ¿Estás seguro de que querés eliminar al usuario <strong>{userName}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

interface UserRowMobileProps {
  user: Usuario
  onAssignRole: () => void
  onDelete: () => void
}

function UserCardMobile({ user, onAssignRole, onDelete }: UserRowMobileProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">{user.nombre}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </div>
      <div className="mb-3 space-y-1 text-sm text-gray-600">
        {user.telefono && <p>Tel: {user.telefono}</p>}
        <p>Registro: {formatDate(user.created_at)}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onAssignRole}>
          Asignar Rol
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          Eliminar
        </Button>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const toast = useToast()
  const { data: users = [], isLoading } = useQuery<Usuario[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null)
  const [roleTarget, setRoleTarget] = useState<Usuario | null>(null)

  const removeUser = useRemoveUser(deleteTarget?.id ?? 0)

  const activeUsers = users.filter((u) => !u.eliminado_en)

  const filtered = activeUsers.filter((u) => {
    const term = search.toLowerCase()
    return (
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    )
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(0)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    removeUser.mutate(undefined, {
      onSuccess: () => {
        toast.success('Usuario eliminado')
        setDeleteTarget(null)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
        setDeleteTarget(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center shadow-sm">
          <p className="text-gray-500">
            {search ? 'No se encontraron usuarios con esa búsqueda' : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Roles</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Teléfono</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Fecha registro</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.telefono || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setRoleTarget(user)}
                        >
                          Asignar Rol
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(user)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-4 md:hidden">
            {paginated.map((user) => (
              <UserCardMobile
                key={user.id}
                user={user}
                onAssignRole={() => setRoleTarget(user)}
                onDelete={() => setDeleteTarget(user)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length} usuarios
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <ConfirmDialog
          userName={deleteTarget.nombre}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={removeUser.isPending}
        />
      )}

      {/* Assign role dialog */}
      {roleTarget && (
        <AssignRoleDialog
          userId={roleTarget.id}
          userName={roleTarget.nombre}
          currentRoles={roleTarget.roles}
          onClose={() => setRoleTarget(null)}
          onSuccess={() => setRoleTarget(null)}
        />
      )}
    </div>
  )
}