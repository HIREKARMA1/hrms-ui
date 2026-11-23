/**
 * Read-only approval workflows from GET /leave-approval/workflows.
 */

import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetApprovalWorkflowsQuery } from '../../api/leaveApprovalApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import type { ApprovalWorkflowTableRow } from '../../types/api/leaveApprovalWorkflows.types'
import { mapApiApprovalWorkflowsToTableRows } from '../../utils/mapApiApprovalWorkflows'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { RowLinkButton } from '../shared/LeaveRowActions'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'
import { ApprovalWorkflowDetailDialog } from './ApprovalWorkflowDetailDialog'

export function ApprovalWorkflowsLiveTable() {
  const [detailRow, setDetailRow] = useState<ApprovalWorkflowTableRow | null>(null)
  const canFetch = useShouldFetchLeaveList()
  const { data, isError, error, isFetching } = useGetApprovalWorkflowsQuery(undefined, {
    skip: !canFetch,
  })

  const rows = data && !isError ? mapApiApprovalWorkflowsToTableRows(data) : []
  const errorMessage =
    canFetch && isError
      ? getApiErrorMessage(error, 'Unable to load approval workflows from the server.')
      : null

  if (!canFetch) return null

  return (
    <>
      <Card>
        <CardHeader className="border-b border-hrms-border pb-3">
          <CardTitle className="text-base font-semibold text-hrms-navy">Approval workflows (live)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-0 text-sm">
          <p className="px-5 pt-4 text-xs text-hrms-text-muted">
            From the server. Per-type approval below remains demo settings until write APIs are wired.
          </p>
          {errorMessage ? (
            <p
              className="mx-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}
          {isFetching ? (
            <p className="px-5 py-4 text-xs text-hrms-text-muted">Loading approval workflows…</p>
          ) : null}
          {!isFetching && rows.length === 0 ? (
            <div className="p-4">
              <LeaveEmptyState message="No approval workflows returned from the API." />
            </div>
          ) : (
            <div className="min-w-0 overflow-x-auto">
              <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
                <thead className={LEAVE_TABLE_THEAD}>
                  <tr>
                    <th className={leaveThClass('left', 'w-[20%]')}>Workflow</th>
                    <th className={leaveThClass('left', 'w-[10%]')}>Leave type</th>
                    <th className={leaveThClass('left', 'w-[38%]')}>Steps</th>
                    <th className={leaveThClass('left', 'w-[10%]')}>Status</th>
                    <th className={leaveThClass('right', 'w-[10%]')}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className={LEAVE_TABLE_ROW}
                      tabIndex={0}
                      onClick={() => setDetailRow(row)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setDetailRow(row)
                        }
                      }}
                    >
                      <td className={leaveTdClass('left', 'font-medium')}>{row.name}</td>
                      <td className={leaveTdClass('left', 'font-normal')}>
                        {row.leaveTypeCode !== '—' ? (
                          <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                        ) : (
                          <span className="text-hrms-text-secondary">All / default</span>
                        )}
                      </td>
                      <td className={leaveTdClass('left', 'font-normal')}>{row.stepsSummary}</td>
                      <td className={leaveTdClass('left', 'font-normal')}>
                        <LeaveStatusPill status={row.active ? 'Active' : 'Inactive'} />
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <RowLinkButton onClick={() => setDetailRow(row)}>View</RowLinkButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <ApprovalWorkflowDetailDialog
        open={Boolean(detailRow)}
        row={detailRow}
        onOpenChange={(open) => !open && setDetailRow(null)}
        useLiveApi={canFetch}
      />
    </>
  )
}