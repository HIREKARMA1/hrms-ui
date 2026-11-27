import type { OnProbationData } from '../api/employeeDashboardApi.types'

export function formatOnProbationSubtitle(data: OnProbationData | undefined): string {
  if (!data) {
    return 'Employees with probation status · newest joiners first'
  }
  const total = data.pagination?.total ?? data.items.length
  return `${total} on probation · newest joiners first`
}