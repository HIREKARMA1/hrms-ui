/**
 * Read-only carry-forward policies from GET /leave-policies/carry-forward.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetCarryForwardPoliciesQuery } from '../../api/leavePoliciesApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import { mapApiCarryForwardPoliciesToTableRows } from '../../utils/mapApiCarryForwardPolicies'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

export function CarryForwardPoliciesLiveTable() {
  const canFetch = useShouldFetchLeaveList()
  const { data, isError, error, isFetching } = useGetCarryForwardPoliciesQuery(undefined, {
    skip: !canFetch,
  })

  const rows = data && !isError ? mapApiCarryForwardPoliciesToTableRows(data) : []
  const errorMessage =
    canFetch && isError
      ? getApiErrorMessage(error, 'Unable to load carry-forward policies from the server.')
      : null

  if (!canFetch) return null

  return (
    <Card>
      <CardHeader className="border-b border-hrms-border pb-3">
        <CardTitle className="text-base font-semibold text-hrms-navy">Carry-forward policies (live)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-0 text-sm">
        {errorMessage ? (
          <p
            className="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        {isFetching ? (
          <p className="px-5 py-4 text-xs text-hrms-text-muted">Loading carry-forward policies…</p>
        ) : null}
        {!isFetching && rows.length === 0 ? (
          <div className="p-4">
            <LeaveEmptyState message="No carry-forward policies returned from the API." />
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  <th className={leaveThClass('left', 'w-[20%]')}>Leave type</th>
                  <th className={leaveThClass('left', 'w-[16%]')}>Mode</th>
                  <th className={leaveThClass('left', 'w-[22%]')}>Carry cap</th>
                  <th className={leaveThClass('left', 'w-[18%]')}>Encashment</th>
                  <th className={leaveThClass('left', 'w-[14%]')}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={LEAVE_TABLE_ROW}>
                    <td className={leaveTdClass('left')}>
                      <div className="flex flex-wrap items-center gap-2">
                        <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                        <span>{row.leaveTypeName}</span>
                      </div>
                    </td>
                    <td className={leaveTdClass('left', 'font-normal')}>{row.mode}</td>
                    <td className={leaveTdClass('left', 'font-normal')}>{row.capDetail}</td>
                    <td className={leaveTdClass('left', 'font-normal')}>{row.encashment}</td>
                    <td className={leaveTdClass('left', 'font-normal')}>
                      <LeaveStatusPill status={row.active ? 'Active' : 'Inactive'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}