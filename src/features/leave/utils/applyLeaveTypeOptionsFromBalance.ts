/**
 * Apply-for-leave dropdown options from GET leave balance rows (Swagger — no extra APIs).
 */
import type { LeaveBalanceRow } from '../api/leaveMappers'

export type ApplyLeaveTypeOption = {
  code: string
  label: string
  available: number
  used: number
  pending: number
}

/** `null` = use settings catalog (demo). Non-null = server balance mode (may be empty while loading). */
export function applyLeaveTypeOptionsFromBalance(
  rows: LeaveBalanceRow[] | null | undefined,
): ApplyLeaveTypeOption[] | null {
  if (rows === null || rows === undefined) return null
  const seen = new Set<string>()
  const out: ApplyLeaveTypeOption[] = []
  for (const row of rows) {
    const code = row.leaveTypeCode.trim().toUpperCase()
    if (!code || seen.has(code)) continue
    seen.add(code)
    const label = row.leaveTypeName.trim() || code
    out.push({
      code,
      label,
      available: row.available,
      used: row.used,
      pending: row.pending,
    })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}