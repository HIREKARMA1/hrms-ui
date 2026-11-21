import type { BalanceCardModel } from '../components/myLeave/MyLeaveBalanceCards'
import { LEAVE_TYPE_CODES, type LeaveTypeCode } from '../constants/leaveTypeCodes'
import type {
  ApiEmployeeLeaveBalanceRow,
  LeaveBalanceData,
} from '../types/api/leaveBalance.types'

function resolveTypeCode(row: ApiEmployeeLeaveBalanceRow): LeaveTypeCode | null {
  const raw = (row.leaveType?.code ?? row.leaveTypeCode ?? '').trim().toUpperCase()
  if (!raw) return null
  return (LEAVE_TYPE_CODES as readonly string[]).includes(raw)
    ? (raw as LeaveTypeCode)
    : null
}

export function mapApiLeaveBalanceToCards(data: LeaveBalanceData): BalanceCardModel[] {
  const rows: BalanceCardModel[] = []
  for (const item of data.items) {
    const code = resolveTypeCode(item)
    if (!code) continue
    const available = item.available ?? 0
    const used = item.used ?? 0
    const pending = item.pending ?? 0
    if (available <= 0 && used <= 0 && pending <= 0) continue
    rows.push({ code, available, used, pending })
  }
  return rows
}