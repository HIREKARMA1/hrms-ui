/**
 * HR Balances: GET /employee-leave-policies/hr-overview.
 */

import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetEmployeeLeavePolicyHrOverviewQuery } from '../../api/employeeLeavePoliciesApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import {
  collectHrOverviewBalanceTypeCodes,
  mapApiEmployeeLeavePolicyHrOverviewToTableRows,
} from '../../utils/mapApiEmployeeLeavePolicyHrOverview'
import { leaveTodayIso } from '../../utils/leaveToday'
import { BalanceLedgerDialog } from '../dialogs/BalanceLedgerDialog'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type BalancesHrOverviewLiveSectionProps = {
  search: string
  onSearchChange: (value: string) => void
  selectedEmployeeId: string | null
  onSelectEmployeeId: (employeeId: string | null) => void
}

export function BalancesHrOverviewLiveSection({
  search,
  onSearchChange,
  selectedEmployeeId,
  onSelectEmployeeId,
}: BalancesHrOverviewLiveSectionProps) {
  const canFetch = useShouldFetchLeaveList()
  const year = Number(leaveTodayIso().slice(0, 4))
  const trimmedSearch = search.trim()

  const { data, isError, error, isFetching } = useGetEmployeeLeavePolicyHrOverviewQuery(
    {
      page: 1,
      limit: 100,
      year,
      search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
    },
    { skip: !canFetch },
  )

  const rows = useMemo(() => {
    if (!data || isError) return []
    return mapApiEmployeeLeavePolicyHrOverviewToTableRows(data)
  }, [data, isError])

  const typeCodes = useMemo(() => collectHrOverviewBalanceTypeCodes(rows), [rows])

  const errorMessage =
    canFetch && isError
      ? getApiErrorMessage(error, 'Unable to load employee balances from the server.')
      : null

  const total = data?.total ?? rows.length

  if (!canFetch) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b border-hrms-border pb-3">
          <CardTitle className="text-base font-semibold text-hrms-navy">Employee balances (live)</CardTitle>
          <p className="text-xs font-normal text-hrms-text-muted">
            From HR overview for {year}. Open a row for ledger detail. Demo balances table below is unchanged until save
            and adjust APIs are wired.
          </p>
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
            <p className="px-5 py-4 text-xs text-hrms-text-muted">Loading employee balances…</p>
          ) : null}
          <div className="px-4 pb-2 pt-3">
            <LeaveTableFilters
              searchId="balances-live-search"
              searchPlaceholder="Search employees (server)"
              searchValue={search}
              onSearchChange={onSearchChange}
              showing={rows.length}
              total={total}
            />
          </div>
          {!isFetching && rows.length === 0 ? (
            <div className="p-4">
              <LeaveEmptyState message="No employee balances returned from the API for this search." />
            </div>
          ) : (
            <div className="min-w-0 overflow-x-auto">
              <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
                <thead className={LEAVE_TABLE_THEAD}>
                  <tr>
                    <th className={leaveThClass('left', 'w-[26%]')}>Employee</th>
                    <th className={leaveThClass('left', 'w-[18%]')}>Department</th>
                    {typeCodes.map((code) => (
                      <th key={code} className={leaveThClass('right', 'w-[10%]')} title={code}>
                        {code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.employeeId}
                      className={LEAVE_TABLE_ROW}
                      tabIndex={0}
                      onClick={() => onSelectEmployeeId(row.employeeId)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onSelectEmployeeId(row.employeeId)
                        }
                      }}
                    >
                      <td className={leaveTdClass('left')}>{row.employeeName}</td>
                      <td className={leaveTdClass('left', 'font-normal')}>{row.departmentName}</td>
                      {typeCodes.map((code) => (
                        <td key={code} className={leaveTdClass('right', 'font-normal')}>
                          {row.balancesByCode[code] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <BalanceLedgerDialog
        open={Boolean(selectedEmployeeId)}
        employeeId={selectedEmployeeId}
        onOpenChange={(open) => !open && onSelectEmployeeId(null)}
      />
    </div>
  )
}