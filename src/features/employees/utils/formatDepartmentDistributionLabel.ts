import type { ByDepartmentItem } from '../api/employeeDashboardApi.types'

export function formatDepartmentDistributionLabel(item: ByDepartmentItem): string {
  const code = item.departmentCode?.trim()
  const name = item.departmentName?.trim() || 'Unassigned'
  if (!code || code === 'UNASSIGNED') return name
  return `${code} · ${name}`
}