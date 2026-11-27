/**
 * Copy for GET /dashboard/employees/by-department.
 */

import type { ByDepartmentData } from '../api/employeeDashboardApi.types'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'active',
  ON_LEAVE: 'on leave',
  PROBATION: 'on probation',
  TERMINATED: 'terminated',
}

export function formatDepartmentDistributionSubtitle(data: ByDepartmentData | undefined): string {
  if (!data) return 'Loading department headcount…'
  const head = `${data.totalEmployees} employee${data.totalEmployees === 1 ? '' : 's'} across departments`
  const status = data.employmentStatus?.trim()
  if (!status) {
    return `${head} · all employment statuses`
  }
  const label = STATUS_LABELS[status] ?? status.toLowerCase().replace(/_/g, ' ')
  return `${head} · ${label} only`
}
