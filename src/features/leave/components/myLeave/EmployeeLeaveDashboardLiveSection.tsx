/**
 * Employee panel → My Leave tab: GET /employee-leave-policies/{employeeId}/dashboard (#22).
 */

import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetEmployeeLeavePolicyDashboardQuery } from '../../api/employeeLeavePoliciesApi'
import { mapApiEmployeeLeavePolicyDashboard } from '../../utils/mapApiEmployeeLeavePolicyDashboard'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type EmployeeLeaveDashboardLiveSectionProps = {
  employeeId: string
  year: number
  enabled: boolean
}

export function EmployeeLeaveDashboardLiveSection({
  employeeId,
  year,
  enabled,
}: EmployeeLeaveDashboardLiveSectionProps) {
  const { data, isError, error, isFetching } = useGetEmployeeLeavePolicyDashboardQuery(
    { employeeId, year },
    { skip: !enabled },
  )

  const view = useMemo(() => {
    if (!data || isError) return null
    return mapApiEmployeeLeavePolicyDashboard(data, year)
  }, [data, isError, year])

  const errorMessage =
    enabled && isError
      ? getApiErrorMessage(error, 'Unable to load your leave dashboard from the server.')
      : null

  if (!enabled) return null

  const hasContent =
    view &&
    (view.summaryCards.length > 0 ||
      view.typeRows.length > 0 ||
      view.accrualCount > 0 ||
      view.applicationsCount > 0 ||
      view.lopCount > 0)

  return (
    <Card>
      <CardHeader className="border-b border-hrms-border pb-3">
        <CardTitle className="text-base font-semibold text-hrms-navy">Leave dashboard (live)</CardTitle>
        <p className="text-xs font-normal text-hrms-text-muted">
          Server dashboard for {view?.year ?? year}. Balance cards below still use GET /leaves/balance until a later
          consolidation.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 text-sm">
        {errorMessage ? (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        {isFetching ? <p className="text-xs text-hrms-text-muted">Loading leave dashboard…</p> : null}
        {!isFetching && !hasContent && !errorMessage ? (
          <p className="text-xs text-hrms-text-muted">No dashboard data returned from the API for this year.</p>
        ) : null}
        {view && view.summaryCards.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {view.summaryCards.map((card) => (
              <div key={card.id} className="rounded-xl bg-hrms-muted-bg px-3 py-2 text-center text-xs">
                <p className="font-semibold text-hrms-navy">{card.label}</p>
                <p className="mt-1 tabular-nums text-hrms-text-secondary">{card.value}</p>
              </div>
            ))}
          </div>
        ) : null}
        {view && view.typeRows.length > 0 ? (
          <div className="min-w-0 overflow-x-auto">
            <table className={cn(LEAVE_TABLE_BASE, 'min-w-0 text-xs')}>
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  <th className={leaveThClass('left')}>Leave type</th>
                  <th className={leaveThClass('right')}>Available</th>
                  <th className={leaveThClass('right')}>Used</th>
                  <th className={leaveThClass('right')}>Pending</th>
                </tr>
              </thead>
              <tbody>
                {view.typeRows.map((row) => (
                  <tr key={row.id} className={LEAVE_TABLE_ROW}>
                    <td className={leaveTdClass('left')}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <LeaveTypeChip code={row.code} abbreviated />
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className={leaveTdClass('right', 'tabular-nums')}>{row.available}</td>
                    <td className={leaveTdClass('right', 'tabular-nums')}>{row.used}</td>
                    <td className={leaveTdClass('right', 'tabular-nums')}>{row.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {view ? (
          <div className="flex flex-wrap gap-3 text-xs text-hrms-text-secondary">
            <span>Accrual history: {view.accrualCount} item(s)</span>
            <span>Applications: {view.applicationsCount} item(s)</span>
            <span>LOP history: {view.lopCount} item(s)</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}