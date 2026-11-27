import type { TerminatedData } from '../api/employeeDashboardApi.types'

export function formatTerminatedSubtitle(data: TerminatedData | undefined): string {
  if (!data) {
    return 'Employees with terminated status · most recently updated first'
  }
  const total = data.pagination?.total ?? data.items.length
  return `${total} terminated · most recently updated first`
}