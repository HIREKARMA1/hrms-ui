/**
 * Client-side checks aligned with production OpenAPI for `/roles`.
 * The server remains authoritative.
 */

export const ROLE_CODE_PATTERN = /^[A-Z][A-Z0-9_]{1,63}$/
export const ROLE_NAME_MAX = 120
export const ROLE_DESCRIPTION_MAX = 500
export const ROLE_SEARCH_MAX = 120

export type CreateRoleFormErrors = {
  code?: string
  name?: string
  description?: string
  form?: string
}

export type UpdateRoleFormErrors = {
  name?: string
  description?: string
  form?: string
}

export function normalizeRoleCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '_')
}

export function validateCreateRoleForm(input: {
  code: string
  name: string
  description: string
}): CreateRoleFormErrors {
  const errors: CreateRoleFormErrors = {}
  const code = normalizeRoleCode(input.code)
  const name = input.name.trim()
  const description = input.description.trim()

  if (!code) errors.code = 'Role code is required.'
  else if (!ROLE_CODE_PATTERN.test(code)) {
    errors.code =
      'Use UPPER_SNAKE_CASE starting with a letter (A–Z, 0–9, underscore; max 64 chars).'
  }

  if (!name) errors.name = 'Role name is required.'
  else if (name.length > ROLE_NAME_MAX) {
    errors.name = `Name must be at most ${ROLE_NAME_MAX} characters.`
  }

  if (description.length > ROLE_DESCRIPTION_MAX) {
    errors.description = `Description must be at most ${ROLE_DESCRIPTION_MAX} characters.`
  }

  return errors
}

export function validateUpdateRoleForm(input: {
  name: string
  description: string
  clearDescription: boolean
  isActive: boolean
  originalName: string
  originalDescription: string | null
  originalIsActive: boolean
  isSystem: boolean
}): UpdateRoleFormErrors {
  const errors: UpdateRoleFormErrors = {}
  const name = input.name.trim()
  const description = input.description.trim()

  if (!name) errors.name = 'Role name is required.'
  else if (name.length > ROLE_NAME_MAX) {
    errors.name = `Name must be at most ${ROLE_NAME_MAX} characters.`
  }

  if (!input.clearDescription && description.length > ROLE_DESCRIPTION_MAX) {
    errors.description = `Description must be at most ${ROLE_DESCRIPTION_MAX} characters.`
  }

  const nextDescription = input.clearDescription ? null : description || null
  const nameChanged = name !== input.originalName
  const descriptionChanged = nextDescription !== input.originalDescription
  const activeChanged = input.isActive !== input.originalIsActive

  if (!nameChanged && !descriptionChanged && !activeChanged) {
    errors.form = 'Change at least one field before saving.'
  }

  if (input.isSystem && activeChanged && !input.isActive) {
    errors.form = 'System roles cannot be deactivated.'
  }

  return errors
}
