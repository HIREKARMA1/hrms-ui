/**
 * Single source for "today" in leave mocks and validation (real date by default).
 * Used by mock data generation and validateLeaveRequest backdating checks.
 */

export function leaveToday(): Date {
  return new Date()
}

export function leaveTodayIso(): string {
  return leaveToday().toISOString().slice(0, 10)
}
