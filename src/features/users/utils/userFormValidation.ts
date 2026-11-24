/**
 * Client-side checks aligned with hrms-server create-user / update-user /
 * assign-user-roles schemas. The server remains authoritative.
 */

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/features/auth/utils/passwordReset'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type CreateUserFormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
  employeeId?: string
  roleId?: string
}

export type UpdateUserFormErrors = {
  email?: string
  employeeId?: string
  form?: string
}

export function validateCreateUserForm(input: {
  email: string
  password: string
  confirmPassword: string
}): CreateUserFormErrors {
  const errors: CreateUserFormErrors = {}
  const email = input.email.trim()
  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'

  if (!input.password) errors.password = 'Password is required.'
  else if (input.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  } else if (input.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`
  }

  if (!input.confirmPassword) errors.confirmPassword = 'Please confirm the password.'
  else if (input.password && input.confirmPassword !== input.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export function validateUpdateUserForm(input: {
  email: string
  employeeId: string
  clearEmployee: boolean
  originalEmail: string
  originalEmployeeId: string | null
}): UpdateUserFormErrors {
  const errors: UpdateUserFormErrors = {}
  const email = input.email.trim()
  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'

  const nextEmployeeId = input.clearEmployee ? null : input.employeeId.trim() || null
  const emailChanged = email !== input.originalEmail
  const employeeChanged = nextEmployeeId !== input.originalEmployeeId

  if (!emailChanged && !employeeChanged) {
    errors.form = 'Change the email or employee link before saving.'
  }

  return errors
}

export { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH }
