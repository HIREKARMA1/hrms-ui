import type { ByStatusData } from '../api/employeeDashboardApi.types'

export function formatEmploymentStatusDistributionSubtitle(
  data: ByStatusData | undefined,
  departmentName?: string,
): string {
  if (!data) {
    return 'Headcount by employment status across the organization'
  }
  const total = data.totalEmployees
  const head = `${total} employee${total === 1 ? '' : 's'}`
  if (data.departmentId && departmentName?.trim()) {
    return `${head} · ${departmentName.trim()} only`
  }
  if (data.departmentId) {
    return `${head} · selected department only`
  }
  return `${head} · all departments`
}

export const EMPLOYMENT_STATUS_DISTRIBUTION_FOOTNOTE =
  'All four statuses are always returned; zero counts are shown in the legend. Pie slices omit empty groups.'