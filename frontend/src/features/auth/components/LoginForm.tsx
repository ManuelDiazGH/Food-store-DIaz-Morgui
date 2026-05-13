import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useLogin } from '@entities/api/authApi'
import { useAuthStore } from '@features/auth/store/authStore'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { ROUTES } from '@shared/config/routes'
import { getErrorMessage, getErrorStatus } from '@shared/utils/errorHandler'

export function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')

  const loginMutation = useLogin()

  if (isAuthenticated) {
    const redirect = searchParams.get('redirect') || ROUTES.DASHBOARD
    navigate(redirect, { replace: true })
  }

  function validate(): boolean {
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = 'Ingresá tu email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!password) {
      newErrors.password = 'Ingresá tu contraseña'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setServerError('')

    if (!validate()) return

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          const redirect = searchParams.get('redirect') || ROUTES.DASHBOARD
          navigate(redirect, { replace: true })
        },
        onError: (error) => {
          const status = getErrorStatus(error instanceof Error ? error : undefined)
          if (status === 429) {
            setServerError('Demasiados intentos. Esperá unos minutos.')
          } else {
            setServerError(getErrorMessage(error))
          }
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        autoComplete="email"
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="current-password"
      />

      <Button
        type="submit"
        fullWidth
        loading={loginMutation.isPending}
        size="lg"
      >
        Ingresá
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿No tenés cuenta?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          Registrate
        </Link>
      </p>
    </form>
  )
}