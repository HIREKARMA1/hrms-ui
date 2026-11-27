import type {
  ByDepartmentData,
  OnLeaveTodayItem,
} from '@/features/employees/api/employeeDashboardApi.types'

import type { DeptAvailabilityRow } from './overviewDeptAvailability'

export function departmentAvailabilityFromDashboard(
  byDepartment: ByDepartmentData | undefined,
  onLeaveItems: OnLeaveTodayItem[],
  coverageLimit: number | null,
): DeptAvailabilityRow[] {
  const awayByDept = new Map<string, number>()
  for (const item of onLeaveItems) {
    const name = item.department?.name?.trim() || 'Unassigned'
    awayByDept.set(name, (awayByDept.get(name) ?? 0) + 1)
  }

  const rows: DeptAvailabilityRow[] = (byDepartment?.items ?? [])
    .filter((row) => row.employeeCount > 0)
    .map((row) => {
      const department = row.departmentName?.trim() || 'Unassigned'
      const onLeave = awayByDept.get(department) ?? 0
      const headcount = row.employeeCount
      const percent = headcount > 0 ? Math.round((onLeave / headcount) * 100) : 0
      let severity: DeptAvailabilityRow['severity'] = 'ok'
      if (coverageLimit !== null && onLeave > coverageLimit) severity = 'danger'
      else if (coverageLimit !== null && onLeave >= coverageLimit) severity = 'warn'
      return { department, headcount, onLeave, percent, severity }
    })

  for (const [department, onLeave] of awayByDept) {
    if (rows.some((row) => row.department === department)) continue
    rows.push({
      department,
      headcount: Math.max(onLeave, 1),
      onLeave,
      percent: 100,
      severity: 'ok',
    })
  }

  return rows.sort((a, b) => b.onLeave - a.onLeave || a.department.localeCompare(b.department))
}