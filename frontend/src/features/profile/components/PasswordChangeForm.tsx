import { useState, type FormEvent } from 'react'
import { useChangePassword } from '@entities/api/perfilApi'
import { useAuthStore } from '@features/auth/store/authStore'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@shared/config/routes'

export function PasswordChangeForm() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const changePassword = useChangePassword()

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (passwordNueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    if (passwordNueva !== passwordConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    changePassword.mutate(
      { password_actual: passwordActual, password_nueva: passwordNueva },
      {
        onSuccess: () => {
          clearAuth()
          navigate(ROUTES.LOGIN)
        },
        onError: (err) => {
          setError(err.message || 'Error al cambiar la contraseña')
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div>
        <label htmlFor="passwordActual" className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
        <input
          id="passwordActual"
          type="password"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          placeholder="Tu contraseña actual"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label htmlFor="passwordNueva" className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
        <input
          id="passwordNueva"
          type="password"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="Repetir nueva contraseña"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <button
        type="submit"
        disabled={changePassword.isPending}
        className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
      >
        {changePassword.isPending ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>

      {changePassword.isSuccess && (
        <p className="text-green-600 text-sm">Contraseña actualizada. Serás redirigido al login.</p>
      )}
    </form>
  )
}