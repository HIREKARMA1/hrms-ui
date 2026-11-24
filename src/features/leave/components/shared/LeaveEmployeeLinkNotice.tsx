/**
 * Shown only when the signed-in auth user has no linked Employee id
 * (`employeeId` missing on login / refresh / GET /auth/me). Personal leave
 * requests stay blocked while this is shown.
 */

import { EMPLOYEE_RECORD_UNAVAILABLE_MESSAGE } from '../../constants/employeeRecordMessages'

export function LeaveEmployeeLinkNotice() {
  return (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {EMPLOYEE_RECORD_UNAVAILABLE_MESSAGE}
    </div>
  )
}
