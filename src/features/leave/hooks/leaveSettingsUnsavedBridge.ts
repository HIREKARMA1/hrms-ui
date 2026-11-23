/**
 * Lets LeavePage block tab or demo-role changes when settings have unsaved edits.
 */

type Guard = {
  isDirty: boolean
  discard: () => void
  promptConfirm: () => boolean
}

let guard: Guard | null = null

export function registerLeaveSettingsGuard(next: Guard | null) {
  guard = next
}

export function consumeLeaveSettingsGuard() {
  return guard
}
