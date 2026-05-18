/**
 * Validadores reutilizables para formularios del frontend.
 *
 * Provee funciones de validación de formato que se comparten entre features.
 */

/**
 *Regex para teléfono argentino.
 *
 * Acepta formatos:
 * - Internacional: +5491112345678
 * - Con espacios: +54 9 11 1234 5678
 * - Local: 01112345678, 12345678
 *
 * Requisito US-062: validación de formato de teléfono.
 */
const PHONE_REGEX = /^(\+54\d{10,12}|\d{8,15})$/

/**
 * Valida formato de teléfono argentino.
 *
 * @param phone - Número de teléfono a validar. Vacío/no utilizado es válido (campo opcional).
 * @returns Mensaje de error si es inválido, undefined si es válido.
 */
export function validatePhone(phone: string | undefined | null): string | undefined {
  if (!phone || phone.trim() === '') return undefined

  // Eliminar espacios internos para validar
  const compact = phone.replace(/\s+/g, '')

  if (!PHONE_REGEX.test(compact)) {
    return 'Formato de teléfono inválido. Usá +5491112345678 o número local (8-15 dígitos).'
  }

  return undefined
}