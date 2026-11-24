/**
 * Fetches and shows GET /leaves/history/{employeeId}.
 */
import { History } from 'lucide-react'
import { useMemo } from 'react'

import { LEAVE_MAX_LIMIT, getLeaveErrorMessage, useGetLeaveHistoryQuery } from '../../api/leaveApi'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveInlineLoading } from '../shared/LeaveServerNotice'
import type { LeaveRequest } from '../../types/leaveRequest'
import { EmployeeLeaveHistoryTable } from './EmployeeLeaveHistoryTable'

type EmployeeLeaveHistorySectionProps = {
  employeeId: string
  enabled: boolean
  year?: number
  title?: string
  onView?: (row: LeaveRequest) => void
}

export function EmployeeLeaveHistorySection({
  employeeId,
  enabled,
  year,
  title = 'Leave history',
  onView,
}: EmployeeLeaveHistorySectionProps) {
  const history = useGetLeaveHistoryQuery(
    { employeeId, page: 1, limit: LEAVE_MAX_LIMIT, ...(year !== undefined ? { year } : {}) },
    { skip: !enabled || !employeeId },
  )

  const rows = useMemo(() => history.data?.items ?? [], [history.data])

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-hrms-navy">
        <History className="h-4 w-4 text-hrms-primary" aria-hidden />
        {title}
        {year !== undefined ? <span className="font-normal text-hrms-text-secondary">({year})</span> : null}
      </div>
      {history.isFetching && !history.data ? (
        <LeaveInlineLoading label="Loading leave history…" />
      ) : history.isError && !history.data ? (
        <LeaveErrorState
          message={getLeaveErrorMessage(history.error, 'Could not load leave history.')}
          onRetry={() => void history.refetch()}
        />
      ) : (
        <EmployeeLeaveHistoryTable rows={rows} onView={onView} />
      )}
      {history.data && history.data.pagination.total > rows.length ? (
        <p className="text-xs text-hrms-text-muted">
          Showing {rows.length} of {history.data.pagination.total} requests. Narrow the year filter or use Requests for the full list.
        </p>
      ) : null}
    </section>
  )
}