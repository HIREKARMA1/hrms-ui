/**
 * Shared submit helpers for role create / update / delete (testable without React).
 */
import { createSubmitGuard, type SubmitGuard } from '@/features/auth/utils/passwordReset'

import { getRoleErrorMessage } from '../api/rolesApi'
import type { BackendRole, CreateRoleBody, UpdateRoleBody } from '../api/rolesApi.types'
import {
  normalizeRoleCode,
  validateCreateRoleForm,
  validateUpdateRoleForm,
  type CreateRoleFormErrors,
  type UpdateRoleFormErrors,
} from './roleFormValidation'

export { createSubmitGuard }
export type { SubmitGuard }

export type CreateRoleOutcome =
  | { status: 'busy' }
  | { status: 'invalid'; errors: CreateRoleFormErrors }
  | { status: 'success'; role: BackendRole }
  | { status: 'error'; message: string }

export type UpdateRoleOutcome =
  | { status: 'busy' }
  | { status: 'invalid'; errors: UpdateRoleFormErrors }
  | { status: 'success'; role: BackendRole }
  | { status: 'error'; message: string }

export type DeleteRoleOutcome =
  | { status: 'busy' }
  | { status: 'blocked'; message: string }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function submitCreateRole(input: {
  code: string
  name: string
  description: string
  isActive: boolean
  guard: SubmitGuard
  send: (body: CreateRoleBody) => { unwrap: () => Promise<BackendRole> }
}): Promise<CreateRoleOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const errors = validateCreateRoleForm(input)
    if (errors.code || errors.name || errors.description) {
      return { status: 'invalid', errors }
    }
    const body: CreateRoleBody = {
      code: normalizeRoleCode(input.code),
      name: input.name.trim(),
      isActive: input.isActive,
    }
    const description = input.description.trim()
    if (description) body.description = description

    const role = await input.send(body).unwrap()
    return { status: 'success', role }
  } catch (error) {
    return {
      status: 'error',
      message: getRoleErrorMessage(error, 'Could not create this role.'),
    }
  } finally {
    input.guard.leave()
  }
}

export async function submitUpdateRole(input: {
  id: string
  name: string
  description: string
  clearDescription: boolean
  isActive: boolean
  original: BackendRole
  guard: SubmitGuard
  send: (arg: { id: string; body: UpdateRoleBody }) => {
    unwrap: () => Promise<BackendRole>
  }
}): Promise<UpdateRoleOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const errors = validateUpdateRoleForm({
      name: input.name,
      description: input.description,
      clearDescription: input.clearDescription,
      isActive: input.isActive,
      originalName: input.original.name,
      originalDescription: input.original.description,
      originalIsActive: input.original.isActive,
      isSystem: input.original.isSystem,
    })
    if (errors.name || errors.description || errors.form) {
      return { status: 'invalid', errors }
    }

    const body: UpdateRoleBody = {}
    const nextName = input.name.trim()
    if (nextName !== input.original.name) body.name = nextName

    const nextDescription = input.clearDescription
      ? null
      : input.description.trim() || null
    if (nextDescription !== input.original.description) {
      body.description = nextDescription
    }

    if (input.isActive !== input.original.isActive) {
      body.isActive = input.isActive
    }

    const role = await input.send({ id: input.id, body }).unwrap()
    return { status: 'success', role }
  } catch (error) {
    return {
      status: 'error',
      message: getRoleErrorMessage(error, 'Could not update this role.'),
    }
  } finally {
    input.guard.leave()
  }
}

export async function submitDeleteRole(input: {
  role: BackendRole
  guard: SubmitGuard
  send: (id: string) => { unwrap: () => Promise<unknown> }
}): Promise<DeleteRoleOutcome> {
  if (input.role.isSystem) {
    return { status: 'blocked', message: 'System roles cannot be deleted.' }
  }
  if (input.role.userCount > 0) {
    return {
      status: 'blocked',
      message: 'This role still has user assignments and cannot be deleted.',
    }
  }
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    await input.send(input.role.id).unwrap()
    return { status: 'success' }
  } catch (error) {
    return {
      status: 'error',
      message: getRoleErrorMessage(error, 'Could not delete this role.'),
    }
  } finally {
    input.guard.leave()
  }
}
