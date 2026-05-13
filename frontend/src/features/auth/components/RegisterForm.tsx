import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useRegister } from '@entities/api/authApi'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { ROUTES } from '@shared/config/routes'
import { getErrorMessage, getErrorStatus } from '@shared/utils/errorHandler'

export function RegisterForm() {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const registerMutation = useRegister()

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!nombre) {
      newErrors.nombre = 'Ingresá tu nombre'
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!email) {
      newErrors.email = 'Ingresá tu email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!password) {
      newErrors.password = 'Ingresá una contraseña'
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmá tu contraseña'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setServerError('')

    if (!validate()) return

    registerMutation.mutate(
      {
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        telefono: telefono.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate(ROUTES.DASHBOARD, { replace: true })
        },
        onError: (error) => {
          const status = getErrorStatus(error instanceof Error ? error : undefined)
          if (status === 409) {
            setServerError('El email ya está registrado')
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
        label="Nombre"
        type="text"
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        error={errors.nombre}
        required
        autoComplete="given-name"
      />

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
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="new-password"
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="Repetí tu contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
      />

      <Input
        label="Teléfono"
        type="tel"
        placeholder="Opcional"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        error={errors.telefono}
        autoComplete="tel"
      />

      <Button
        type="submit"
        fullWidth
        loading={registerMutation.isPending}
        size="lg"
      >
        Creá tu cuenta
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          Ingresá
        </Link>
      </p>
    </form>
  )
}