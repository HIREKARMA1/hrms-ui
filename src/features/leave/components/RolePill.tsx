/**
 * Demo role pill shown beside the signed-in user on Leave page header.
 */

import { USER_ROLE_DISPLAY_NAMES, type UserRole } from '../constants/userRoles'

export function RolePill({ role }: { role: UserRole }) {
  return (
    <span className="rounded-full bg-hrms-lavender px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-hrms-primary">
      {USER_ROLE_DISPLAY_NAMES[role]}
    </span>
  )
}
