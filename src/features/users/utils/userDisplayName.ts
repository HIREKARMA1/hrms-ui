import type { BackendUser, BackendUserEmployeeSummary } from '../api/usersApi.types'

/** Placeholder when the user has no linked employee name from the API. */
export const USER_NAME_NOT_PROVIDED = '—'

/**
 * Full name from the production users payload (`employee.firstName` +
 * `employee.lastName`). Never invents a name from email.
 */
export function formatUserDisplayName(
  user: Pick<BackendUser, 'employee'> | { employee: BackendUserEmployeeSummary | null },
): string {
  const employee = user.employee
  if (!employee) return USER_NAME_NOT_PROVIDED

  const parts = [employee.firstName, employee.lastName]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)

  return parts.length > 0 ? parts.join(' ') : USER_NAME_NOT_PROVIDED
}
