/**
 * Register (create) a user, optionally elevating with POST /users/:id/roles.
 *
 * Backend create always assigns EMPLOYEE. Admin/HR registration therefore
 * requires `users:assign_roles` and a role id from GET /roles. Passwords are
 * never returned to the caller after submit.
 */

import type { CreateUserBody, BackendUser } from '../api/usersApi.types'
import { createSubmitGuard, type SubmitGuard } from '@/features/auth/utils/passwordReset'
import { getUserErrorMessage } from '../api/usersApi'
import { validateCreateUserForm, type CreateUserFormErrors } from './userFormValidation'

export { createSubmitGuard }
export type { SubmitGuard }

export type RegisterUserSend = {
  create: (body: CreateUserBody) => { unwrap: () => Promise<BackendUser> }
  assignRoles: (arg: { id: string; body: { roleIds: string[] } }) => {
    unwrap: () => Promise<BackendUser>
  }
}

export type RegisterUserOutcome =
  | { status: 'busy' }
  | { status: 'invalid'; errors: CreateUserFormErrors }
  | { status: 'success'; user: BackendUser; roleAssigned: boolean }
  | { status: 'error'; message: string; createdUser?: BackendUser }

/**
 * Creates the account, then optionally assigns one extra role. If role
 * assignment fails after create, the outcome still includes `createdUser`
 * so the UI can show the EMPLOYEE account that was created.
 */
export async function submitRegisterUser(input: {
  email: string
  password: string
  confirmPassword: string
  employeeId?: string
  /** When set and not the default EMPLOYEE role, assign after create. */
  roleId?: string | null
  send: RegisterUserSend
  guard: SubmitGuard
}): Promise<RegisterUserOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const errors = validateCreateUserForm({
      email: input.email,
      password: input.password,
      confirmPassword: input.confirmPassword,
    })
    if (errors.email || errors.password || errors.confirmPassword) {
      return { status: 'invalid', errors }
    }

    const created = await input.send
      .create({
        email: input.email.trim(),
        password: input.password,
        ...(input.employeeId?.trim() ? { employeeId: input.employeeId.trim() } : {}),
      })
      .unwrap()

    const roleId = input.roleId?.trim()
    if (!roleId) {
      return { status: 'success', user: created, roleAssigned: false }
    }

    // Skip assign when the chosen role is already present (e.g. EMPLOYEE).
    if (created.roles.some((role) => role.id === roleId)) {
      return { status: 'success', user: created, roleAssigned: false }
    }

    try {
      const elevated = await input.send.assignRoles({ id: created.id, body: { roleIds: [roleId] } }).unwrap()
      return { status: 'success', user: elevated, roleAssigned: true }
    } catch (error) {
      return {
        status: 'error',
        message: getUserErrorMessage(
          error,
          'The user was created as EMPLOYEE, but the selected role could not be assigned.',
        ),
        createdUser: created,
      }
    }
  } catch (error) {
    return {
      status: 'error',
      message: getUserErrorMessage(error, 'Could not create the user. Please try again.'),
    }
  } finally {
    input.guard.leave()
  }
}
