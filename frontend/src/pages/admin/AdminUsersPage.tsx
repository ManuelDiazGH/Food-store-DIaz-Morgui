import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@entities/api/axios'
import type { Usuario } from '@entities/types'
import { useRemoveUser } from '@features/admin/hooks/useUserMutations'
import { useToggleUserStatus, useUpdateUserData } from '@entities/api/adminApi'
import { RoleBadge } from '@features/admin/components/RoleBadge'
import { AssignRoleDialog } from '@features/admin/components/AssignRoleDialog'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Spinner } from '@shared/ui/Spinner'
import { useToast } from '@shared/ui/Toast'
import { getErrorMessage } from '@shared/utils/errorHandler'

const PAGE_SIZE = 10

const ALL_ROLES = ['ADMIN', 'STOCK', 'PEDIDOS', 'CLIENT'] as const

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
        <h3 className="mb-2 text-lg font-semibold text-stone-900">
          Confirmar eliminación
        </h3>
        <p className="mb-6 text-sm text-stone-600">
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

interface EditModalProps {
  user: Usuario
  onClose: () => void
  onSuccess: () => void
}

function EditUserModal({ user, onClose, onSuccess }: EditModalProps) {
  const toast = useToast()
  const updateUser = useUpdateUserData()
  const [nombre, setNombre] = useState(user.nombre)
  const [email, setEmail] = useState(user.email)
  const [telefono, setTelefono] = useState(user.telefono ?? '')

  function handleSave() {
    updateUser.mutate(
      { id: user.id, nombre, email, telefono: telefono || undefined },
      {
        onSuccess: () => {
          toast.success('Usuario actualizado')
          onSuccess()
        },
        onError: (error) => {
          toast.error(getErrorMessage(error))
        },
      },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-stone-900">
          Editar usuario
        </h3>
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={updateUser.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={updateUser.isPending}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}

interface UserRowMobileProps {
  user: Usuario
  onAssignRole: () => void
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

function UserCardMobile({ user, onAssignRole, onEdit, onDelete, onToggle }: UserRowMobileProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-medium text-stone-900">{user.nombre}</p>
          <p className="text-sm text-stone-500">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </div>
      <div className="mb-3 space-y-1 text-sm text-stone-600">
        {user.telefono && <p>Tel: {user.telefono}</p>}
        <p>Registro: {formatDate(user.created_at)}</p>
        <p>
          Estado:{' '}
          <span className={user.activo !== false ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {user.activo !== false ? 'Activo' : 'Inactivo'}
          </span>
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="secondary" size="sm" onClick={onAssignRole}>
          Asignar Rol
        </Button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Editar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggle}
        >
          {user.activo !== false ? 'Desactivar' : 'Activar'}
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
  const [editTarget, setEditTarget] = useState<Usuario | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>('')

  const removeUser = useRemoveUser(deleteTarget?.id ?? 0)
  const toggleStatus = useToggleUserStatus()

  const activeUsers = users.filter((u) => !u.eliminado_en)

  const filtered = activeUsers.filter((u) => {
    const term = search.toLowerCase()
    const matchesSearch =
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    const matchesRole = !roleFilter || u.roles.includes(roleFilter)
    return matchesSearch && matchesRole
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

  function handleToggleActivo(user: Usuario) {
    toggleStatus.mutate(
      { id: user.id, activo: user.activo === false },
      {
        onSuccess: () => {
          toast.success(user.activo !== false ? 'Usuario desactivado' : 'Usuario activado')
        },
        onError: (error) => {
          toast.error(getErrorMessage(error))
        },
      },
    )
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
        <h1 className="text-2xl font-bold text-stone-900">Gestión de Usuarios</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }}
          >
            <option value="">Todos los roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white py-12 text-center shadow-sm">
          <p className="text-stone-500">
            {search || roleFilter ? 'No se encontraron usuarios con esa búsqueda' : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-600">Nombre</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Email</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Roles</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Teléfono</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Estado</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Fecha registro</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium text-stone-900">
                      {user.nombre}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {user.telefono || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.activo !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setRoleTarget(user)}
                        >
                          Rol
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditTarget(user)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleActivo(user)}
                          loading={toggleStatus.isPending}
                        >
                          {user.activo !== false ? 'Desactivar' : 'Activar'}
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
                onEdit={() => setEditTarget(user)}
                onDelete={() => setDeleteTarget(user)}
                onToggle={() => handleToggleActivo(user)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">
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

      {/* Edit user modal */}
      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
