import { LEAVES_CREATE_PERMISSION } from '../constants/leaveApiAccess'

/** Explains why POST /leaves was not called (live list / API session). */
export function liveApplyBlockedMessage(canApplyLive: boolean, apiEmployeeId: string | null): string {
  const missing: string[] = []
  if (!canApplyLive) {
    missing.push(`permission "${LEAVES_CREATE_PERMISSION}"`)
  }
  if (!apiEmployeeId) {
    missing.push('linked employeeId on your user (see GET /auth/me)')
  }
  if (missing.length === 0) {
    return 'Unable to submit to the server. Please try again.'
  }
  return `Leave was not sent to the server. Your account needs ${missing.join(' and ')}. Ask HR to fix your login profile, then sign in again.`
}