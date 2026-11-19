/**
 * Read-only encashment policies from GET /leave-encashments/policies.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetEncashmentPoliciesQuery } from '../../api/leaveEncashmentsApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import { mapApiEncashmentPoliciesToTableRows } from '../../utils/mapApiEncashmentPolicies'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

export function EncashmentPoliciesLiveTable() {
  const canFetch = useShouldFetchLeaveList()
  const { data, isError, error, isFetching } = useGetEncashmentPoliciesQuery(undefined, {
    skip: !canFetch,
  })

  const rows = data && !isError ? mapApiEncashmentPoliciesToTableRows(data) : []
  const errorMessage =
    canFetch && isError
      ? getApiErrorMessage(error, 'Unable to load encashment policies from the server.')
      : null

  if (!canFetch) return null

  return (
    <Card>
      <CardHeader className="border-b border-hrms-border pb-3">
        <CardTitle className="text-base font-semibold text-hrms-navy">Encashment policies (live)</CardTitle>
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
          <p className="px-5 py-4 text-xs text-hrms-text-muted">Loading encashment policies…</p>
        ) : null}
        {!isFetching && rows.length === 0 ? (
          <div className="p-4">
            <LeaveEmptyState message="No encashment policies returned from the API." />
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  <th className={leaveThClass('left', 'w-[22%]')}>Leave type</th>
                  <th className={leaveThClass('left', 'w-[22%]')}>Min balance</th>
                  <th className={leaveThClass('left', 'w-[20%]')}>Max / year</th>
                  <th className={leaveThClass('left', 'w-[14%]')}>Encashable</th>
                  <th className={leaveThClass('left', 'w-[14%]')}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={LEAVE_TABLE_ROW}>
                    <td className={leaveTdClass('left')}>
                      <div className="flex flex-wrap items-center gap-2">
                        {row.leaveTypeCode !== '—' ? (
                          <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                        ) : null}
                        <span>{row.leaveTypeName}</span>
                      </div>
                    </td>
                    <td className={leaveTdClass('left', 'font-normal')}>{row.minBalance}</td>
                    <td className={leaveTdClass('left', 'font-normal')}>{row.maxPerYear}</td>
                    <td className={leaveTdClass('left', 'font-normal')}>{row.allowed}</td>
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