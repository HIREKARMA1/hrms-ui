/**
 * GET /auth/me does not return the caller's employeeId, so the UI cannot tell
 * whether an employee record is linked. Copy must say the record could not be
 * retrieved, never that it does not exist.
 */
export const EMPLOYEE_RECORD_UNAVAILABLE_MESSAGE =
  "We couldn't retrieve your employee record. Your leave balances and personal requests are temporarily unavailable. Please contact your HR administrator if this continues."
