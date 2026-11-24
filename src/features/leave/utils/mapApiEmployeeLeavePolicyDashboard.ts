import type { ApiEmployeeLeaveBalanceRow } from '../types/api/leaveBalance.types'
import type {
  ApiDashboardCardItem,
  ApiEmployeeLeavePolicyDashboard,
  EmployeeLeaveDashboardSummaryCard,
  EmployeeLeaveDashboardTypeRow,
  EmployeeLeaveDashboardView,
} from '../types/api/employeeLeavePolicyDashboard.types'

function formatMetric(value: number | string | undefined): string {
  if (value === undefined || value === null || value === '') return '—'
  return String(value)
}

function resolveCardLabel(item: ApiDashboardCardItem, index: number): string {
  return (item.label ?? item.title ?? item.name ?? `Metric ${index + 1}`).trim()
}

function resolveCardValue(item: ApiDashboardCardItem): string {
  const raw = item.value ?? item.amount
  const base = formatMetric(raw)
  if (base === '—') return base
  const unit = item.unit?.trim()
  return unit ? `${base} ${unit}` : base
}

function extractSummaryCards(dashboard: ApiEmployeeLeavePolicyDashboard): EmployeeLeaveDashboardSummaryCard[] {
  if (Array.isArray(dashboard.cards) && dashboard.cards.length > 0) {
    return dashboard.cards.map((item, index) => ({
      id: item.id ?? `card-${index}`,
      label: resolveCardLabel(item, index),
      value: resolveCardValue(item),
    }))
  }

  const summary = dashboard.summary
  if (summary && typeof summary === 'object') {
    return Object.entries(summary).map(([key, value], index) => ({
      id: `summary-${index}`,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
      value: typeof value === 'number' || typeof value === 'string' ? String(value) : '—',
    }))
  }

  return []
}

function resolveTypeCode(row: ApiEmployeeLeaveBalanceRow, index: number): string {
  const code = (row.leaveType?.code ?? row.leaveTypeCode ?? '').trim().toUpperCase()
  return code || `TYPE-${index + 1}`
}

function resolveTypeName(row: ApiEmployeeLeaveBalanceRow, code: string): string {
  const name = row.leaveType?.name?.trim()
  if (name) return name
  return code
}

function numField(value: number | undefined): string {
  return typeof value === 'number' ? String(value) : '—'
}

function mapBalanceRow(row: ApiEmployeeLeaveBalanceRow, index: number): EmployeeLeaveDashboardTypeRow {
  const code = resolveTypeCode(row, index)
  return {
    id: row.leaveTypeId ?? `${code}-${index}`,
    code,
    name: resolveTypeName(row, code),
    available: numField(row.available),
    used: numField(row.used),
    pending: numField(row.pending),
  }
}

function collectTypeRows(dashboard: ApiEmployeeLeavePolicyDashboard): EmployeeLeaveDashboardTypeRow[] {
  const candidates: ApiEmployeeLeaveBalanceRow[] = []
  if (Array.isArray(dashboard.perTypeBreakdown)) candidates.push(...dashboard.perTypeBreakdown)
  if (Array.isArray(dashboard.balances)) candidates.push(...dashboard.balances)
  if (Array.isArray(dashboard.leaveTypes)) candidates.push(...dashboard.leaveTypes)

  if (candidates.length > 0) {
    return candidates.map(mapBalanceRow)
  }

  const byType = dashboard.balanceByType
  if (byType && typeof byType === 'object') {
    return Object.entries(byType).map(([key, value], index) => {
      const code = key.trim().toUpperCase()
      if (value && typeof value === 'object') {
        const row = value as Partial<ApiEmployeeLeaveBalanceRow> & {
          available?: number
          used?: number
          pending?: number
        }
        return mapBalanceRow(
          {
            leaveTypeId: row.leaveTypeId ?? `${code}-${index}`,
            leaveTypeCode: code,
            leaveType: row.leaveType ?? { code, name: code },
            available: typeof row.available === 'number' ? row.available : 0,
            used: row.used,
            pending: row.pending,
          },
          index,
        )
      }
      return {
        id: `${code}-${index}`,
        code,
        name: code,
        available: typeof value === 'number' ? String(value) : '—',
        used: '—',
        pending: '—',
      }
    })
  }

  return []
}

function listCount(...lists: unknown[] | undefined[]): number {
  let total = 0
  for (const list of lists) {
    if (Array.isArray(list)) total += list.length
  }
  return total
}

export function mapApiEmployeeLeavePolicyDashboard(
  dashboard: ApiEmployeeLeavePolicyDashboard,
  fallbackYear: number,
): EmployeeLeaveDashboardView {
  const year = typeof dashboard.year === 'number' ? dashboard.year : fallbackYear
  return {
    year,
    summaryCards: extractSummaryCards(dashboard),
    typeRows: collectTypeRows(dashboard),
    accrualCount: listCount(dashboard.accrualHistory, dashboard.accrualTransactions),
    applicationsCount: listCount(dashboard.applications, dashboard.leaveApplications),
    lopCount: listCount(dashboard.lopHistory, dashboard.lossOfPayHistory),
  }
}