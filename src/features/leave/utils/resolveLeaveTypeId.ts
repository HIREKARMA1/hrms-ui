import type { LeaveTypesListData } from '../types/api/leaveTypesList.types'

/** Maps leave type code from Apply dialog to backend `leaveTypeId`. */
export function resolveLeaveTypeIdForCode(
  code: string,
  data: LeaveTypesListData | undefined,
): string | null {
  if (!data?.items.length) return null
  const normalized = code.trim().toUpperCase()
  const item = data.items.find((row) => row.code.trim().toUpperCase() === normalized)
  return item?.id?.trim() || null
}