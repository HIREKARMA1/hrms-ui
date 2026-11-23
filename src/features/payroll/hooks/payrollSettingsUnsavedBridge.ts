/**
 * Shared unsaved guard for Payroll Settings (in-page navigation + optional consumers).
 */

const CONFIRM_MESSAGE =
  'You have unsaved payroll settings changes. Leave Payroll Settings without saving?'

type Guard = {
  isDirty: boolean
  promptConfirm: () => boolean
}

let guard: Guard | null = null

export function registerPayrollSettingsGuard(next: Guard | null) {
  guard = next
}

export function consumePayrollSettingsGuard() {
  return guard
}

export function promptPayrollSettingsLeave(): boolean {
  return guard?.promptConfirm() ?? true
}

export { CONFIRM_MESSAGE as PAYROLL_SETTINGS_LEAVE_CONFIRM }