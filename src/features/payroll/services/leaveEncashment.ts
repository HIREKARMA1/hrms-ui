/**
 * Encashable leave days for F&F — connect Leave balances here when available.
 * Used only by Final Settlement earnings preview and panel.
 */

/** Single integration point for Leave module balance data (mock until connected). */
const MOCK_LEAVE_BALANCES: Record<string, number> = {
  'EMP-1012': 6,
  'EMP-1011': 4,
  'EMP-1006': 3,
  'EMP-1001': 8,
  'EMP-1002': 5,
}

export function getEncashableLeaveDays(employeeId: string): number {
  return MOCK_LEAVE_BALANCES[employeeId] ?? 0
}
