/** Tests para shared/utils/validators.ts */
import { describe, it, expect } from 'vitest'
import { validatePhone } from '../validators'

describe('validatePhone', () => {
  it('should return undefined for empty values (optional field)', () => {
    expect(validatePhone('')).toBeUndefined()
    expect(validatePhone(null)).toBeUndefined()
    expect(validatePhone(undefined)).toBeUndefined()
  })

  it('should accept valid argentine phone formats', () => {
    // International format
    expect(validatePhone('+5491112345678')).toBeUndefined()
    // With spaces
    expect(validatePhone('+54 9 11 1234 5678')).toBeUndefined()
    // Local format
    expect(validatePhone('01112345678')).toBeUndefined()
    // Short local
    expect(validatePhone('12345678')).toBeUndefined()
  })

  it('should reject invalid phone formats', () => {
    // Too short
    expect(validatePhone('12345')).toBeDefined()
    // Letters
    expect(validatePhone('abc123')).toBeDefined()
    // Incomplete international
    expect(validatePhone('+54')).toBeDefined()
  })

  it('should trim whitespace', () => {
    expect(validatePhone('  +5491112345678  ')).toBeUndefined()
  })
})
