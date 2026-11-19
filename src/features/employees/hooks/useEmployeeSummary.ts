import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { useGetEmployeeSummaryQuery } from '../api/employeesApi'

/**
 * GET /dashboard/summary, only requested when the user holds employees:read
 * (`employee.stats`), so widgets shown via the role matrix never trigger a 403.
 */
export function useEmployeeSummary() {
  const { canAccess } = useOptionalFeatureAccess()
  const allowed = canAccess('employee.stats')
  const result = useGetEmployeeSummaryQuery(undefined, { skip: !allowed })
  return {
    allowed,
    summary: allowed ? result.data : undefined,
    isLoading: allowed && result.isLoading,
    isError: allowed && result.isError,
    error: result.error,
    refetch: result.refetch,
  }
}
