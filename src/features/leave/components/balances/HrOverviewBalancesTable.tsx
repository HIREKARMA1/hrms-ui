/**
 * Org-wide balance table and pagination for HR Balances tab.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { HrOverviewBalanceDisplayRow } from '../../utils/enrichHrOverviewBalanceTableRows'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type Props = {
  rows: HrOverviewBalanceDisplayRow[]
  typeCodes: string[]
  leaveTypeLabelByCode: Map<string, string>
  selectedEmployeeId: string | null
  isFetching: boolean
  onSelectEmployee: (employeeId: string | null, displayName?: string) => void
  page: number
  totalPages: number
  total: number
  canGoPrev: boolean
  canGoNext: boolean
  onPageChange: (updater: (value: number) => number) => void
}

export function HrOverviewBalancesTable({
  rows,
  typeCodes,
  leaveTypeLabelByCode,
  selectedEmployeeId,
  isFetching,
  onSelectEmployee,
  page,
  totalPages,
  total,
  canGoPrev,
  canGoNext,
  onPageChange,
}: Props) {
  if (!isFetching && rows.length === 0) {
    return (
      <div className="p-4">
        <LeaveEmptyState message="No employees match this search or no balance data is available yet." />
      </div>
    )
  }

  return (
    <>
      <div className="min-w-0 overflow-x-auto">
        <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              <th className={leaveThClass('left', 'w-[26%]')}>Employee</th>
              <th className={leaveThClass('left', 'w-[18%]')}>Department</th>
              {typeCodes.length > 0 ? (
                typeCodes.map((code) => (
                  <th
                    key={code}
                    className={leaveThClass('right', 'w-[10%]')}
                    title={leaveTypeLabelByCode.get(code) ?? code}
                  >
                    {code}
                  </th>
                ))
              ) : (
                <th className={leaveThClass('left', 'w-[28%]')}>Leave balances</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.employeeId}
                className={cn(LEAVE_TABLE_ROW, row.employeeId === selectedEmployeeId && 'bg-lavender/40')}
                tabIndex={0}
                onClick={() => onSelectEmployee(row.employeeId, row.displayName)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectEmployee(row.employeeId, row.displayName)
                  }
                }}
              >
                <td className={leaveTdClass('left')}>
                  <span className="block font-medium text-hrms-navy">{row.displayName}</span>
                  {row.displayCode ? (
                    <span className="block text-xs font-normal text-hrms-text-muted">{row.displayCode}</span>
                  ) : null}
                </td>
                <td className={leaveTdClass('left', 'font-normal')}>{row.departmentName}</td>
                {typeCodes.length > 0 ? (
                  typeCodes.map((code) => (
                    <td key={code} className={leaveTdClass('right', 'font-normal')}>
                      {typeof row.balancesByCode[code] === 'number'
                        ? row.balancesByCode[code]
                        : '—'}
                    </td>
                  ))
                ) : (
                  <td className={leaveTdClass('left', 'font-normal text-hrms-text-muted')}>
                    Not assigned — select row to configure policies
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hrms-border px-4 py-3">
          <p className="text-xs text-hrms-text-muted">
            Page {page} of {totalPages} · {total} employees
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrev || isFetching}
              onClick={() => onPageChange((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoNext || isFetching}
              onClick={() => onPageChange((value) => value + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}