import axios from 'axios'
import type { AxiosError } from 'axios'

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Por favor, revisá los datos ingresados',
  401: 'Necesitás iniciar sesión',
  403: 'No tenés permisos para realizar esta acción',
  404: 'Recurso no encontrado',
  409: 'Ya existe un registro con esos datos',
  429: 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo',
  500: 'Error interno del servidor. Intentá de nuevo más tarde',
}

const DEFAULT_MESSAGE = 'Ocurrió un error inesperado'

function getDetailMessage(error: AxiosError): string | undefined {
  const data = error.response?.data as Record<string, unknown> | undefined
  if (!data) return undefined

  if (typeof data.detail === 'string') return data.detail

  if (Array.isArray(data.detail)) {
    const messages = data.detail
      .filter((item: unknown) => typeof item === 'object' && item !== null)
      .map((item: { msg?: string; message?: string }) =>
        item.msg ?? item.message ?? '',
      )
      .filter(Boolean)
    if (messages.length > 0) return messages.join('. ')
  }

  if (typeof data.message === 'string') return data.message

  return undefined
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const detailMsg = status ? getDetailMessage(error) : undefined
    if (detailMsg) return detailMsg
    if (status && status in STATUS_MESSAGES) return STATUS_MESSAGES[status]
    if (!error.response) return 'Error de conexión. Verificá tu conexión a internet'
    return DEFAULT_MESSAGE
  }

  if (error instanceof Error) return error.message

  return DEFAULT_MESSAGE
}

export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status
  }
  return undefined
}