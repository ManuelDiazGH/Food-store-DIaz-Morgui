/** Tests para shared/utils/errorHandler.ts */
import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { getErrorMessage, getErrorStatus } from '../errorHandler'

describe('getErrorMessage', () => {
  it('should return default message for unknown error', () => {
    expect(getErrorMessage(null)).toBe('Ocurrió un error inesperado')
    expect(getErrorMessage(undefined)).toBe('Ocurrió un error inesperado')
    expect(getErrorMessage('string')).toBe('Ocurrió un error inesperado')
  })

  it('should return error message for Error instances', () => {
    expect(getErrorMessage(new Error('Algo salió mal'))).toBe('Algo salió mal')
  })

  it('should return connection error when no response', () => {
    const error = new axios.AxiosError('Network Error', 'ERR_NETWORK')
    expect(getErrorMessage(error)).toBe('Error de conexión. Verificá tu conexión a internet')
  })

  it('should return mapped message for known HTTP status', () => {
    const error = new axios.AxiosError('Not Found', '404', undefined, undefined, {
      status: 404,
      data: {},
      statusText: 'Not Found',
      headers: {},
      config: {} as any,
    })
    expect(getErrorMessage(error)).toBe('Recurso no encontrado')
  })

  it('should return detail from response body', () => {
    const error = new axios.AxiosError('Conflict', '409', undefined, undefined, {
      status: 409,
      data: { detail: 'El email ya está registrado' },
      statusText: 'Conflict',
      headers: {},
      config: {} as any,
    })
    expect(getErrorMessage(error)).toBe('El email ya está registrado')
  })

  it('should return detail from array of errors', () => {
    const error = new axios.AxiosError('Bad Request', '400', undefined, undefined, {
      status: 400,
      data: { detail: [{ msg: 'El nombre es obligatorio' }, { msg: 'El email no es válido' }] },
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    })
    expect(getErrorMessage(error)).toBe('El nombre es obligatorio. El email no es válido')
  })
})

describe('getErrorStatus', () => {
  it('should return status from axios error', () => {
    const error = new axios.AxiosError('Not Found', '404', undefined, undefined, {
      status: 404,
      data: {},
      statusText: 'Not Found',
      headers: {},
      config: {} as any,
    })
    expect(getErrorStatus(error)).toBe(404)
  })

  it('should return undefined for non-axios errors', () => {
    expect(getErrorStatus(new Error('test'))).toBeUndefined()
    expect(getErrorStatus(null)).toBeUndefined()
  })
})
