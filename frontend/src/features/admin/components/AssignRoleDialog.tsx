import { useState } from 'react'
import { useAssignRole } from '@features/admin/hooks/useUserMutations'
import { RoleBadge } from './RoleBadge'
import { Button } from '@shared/ui/Button'
import { useToast } from '@shared/ui/Toast'
import { getErrorMessage } from '@shared/utils/errorHandler'
import type { RolCodigo } from '@entities/types'

const AVAILABLE_ROLES: RolCodigo[] = ['ADMIN', 'STOCK', 'PEDIDOS', 'CLIENT']

interface AssignRoleDialogProps {
  userId: number
  userName: string
  currentRoles: string[]
  onClose: () => void
  onSuccess: () => void
}

export function AssignRoleDialog({
  userId,
  userName,
  currentRoles,
  onClose,
  onSuccess,
}: AssignRoleDialogProps) {
  const toast = useToast()
  const assignRole = useAssignRole(userId)
  const [assigning, setAssigning] = useState<string | null>(null)

  const rolesToAdd = AVAILABLE_ROLES.filter(
    (role) => !currentRoles.includes(role),
  )

  function handleAssign(role: RolCodigo) {
    setAssigning(role)
    assignRole.mutate(role, {
      onSuccess: () => {
        toast.success(`Rol "${role}" asignado correctamente`)
        onSuccess()
        onClose()
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
        setAssigning(null)
      },
    })
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Asignar Rol a {userName}
        </h2>

        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600">Roles actuales:</p>
          <div className="flex flex-wrap gap-2">
            {currentRoles.length > 0 ? (
              currentRoles.map((role) => (
                <RoleBadge key={role} role={role} />
              ))
            ) : (
              <span className="text-sm text-gray-400">Sin roles asignados</span>
            )}
          </div>
        </div>

        {rolesToAdd.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">Roles disponibles:</p>
            <div className="flex flex-wrap gap-2">
              {rolesToAdd.map((role) => (
                <Button
                  key={role}
                  variant="secondary"
                  size="sm"
                  loading={assigning === role}
                  disabled={assignRole.isPending}
                  onClick={() => handleAssign(role)}
                >
                  + {role}
                </Button>
              ))}
            </div>
          </div>
        )}

        {rolesToAdd.length === 0 && (
          <p className="mb-4 text-sm text-gray-500">
            Este usuario ya tiene todos los roles disponibles.
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}