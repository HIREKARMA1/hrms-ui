import type { EmploymentStatusBucket } from '../api/employeeDashboardApi.types'

export const EMPLOYMENT_STATUS_CHART_COLORS: Record<EmploymentStatusBucket, string> = {
  ACTIVE: '#16A34A',
  ON_LEAVE: '#3B82F6',
  PROBATION: '#F59E0B',
  TERMINATED: '#64748B',
}