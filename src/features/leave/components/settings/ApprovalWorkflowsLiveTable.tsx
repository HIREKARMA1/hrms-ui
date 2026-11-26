/**
 * Approval workflows from GET /leave-approval/workflows with optional CRUD.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import { useGetApprovalWorkflowsQuery } from '../../api/leaveApprovalApi'
import { useApiApprovalWorkflowCreates } from '../../hooks/useApiApprovalWorkflowCreates'
import { useCanManageApprovalWorkflows } from '../../hooks/useCanManageApprovalWorkflows'
import { useCanViewApprovalWorkflows } from '../../hooks/useCanViewApprovalWorkflows'
import { useLeave } from '../../hooks/useLeave'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import type { ApprovalWorkflowTableRow } from '../../types/api/leaveApprovalWorkflows.types'
import { mapApiApprovalWorkflowsToTableRows } from '../../utils/mapApiApprovalWorkflows'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { RowLinkButton } from '../shared/LeaveRowActions'
import { LEAVE_SECONDARY_BUTTON, LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'
import { ApiApprovalWorkflowDialog } from './ApiApprovalWorkflowDialog'
import { ApprovalWorkflowDetailDialog } from './ApprovalWorkflowDetailDialog'

type Props = {
  leaveTypes: LeaveTypeOption[]
}

export function ApprovalWorkflowsLiveTable({ leaveTypes }: Props) {
  const { snapshot } = useLeave()
  const [detailRow, setDetailRow] = useState<ApprovalWorkflowTableRow | null>(null)
  const canFetch = useCanViewApprovalWorkflows()
  const canManage = useCanManageApprovalWorkflows()
  const { showToast } = useLeaveToast()
  const workflowActions = useApiApprovalWorkflowCreates()

  const { data, isError, error, isFetching } = useGetApprovalWorkflowsQuery(undefined, {
    skip: !canFetch,
  })

  const employees = snapshot?.employees ?? []
  const rows = useMemo(
    () => (data && !isError ? mapApiApprovalWorkflowsToTableRows(data, leaveTypes, employees) : []),
    [data, employees, isError, leaveTypes],
  )
  const deactivateTarget = useMemo(
    () => (workflowActions.deactivateId ? rows.find((row) => row.id === workflowActions.deactivateId) : null),
    [rows, workflowActions.deactivateId],
  )

  const errorMessage =
    canFetch && isError
      ? getApiErrorMessage(error, 'Unable to load approval workflows from the server.')
      : null

  if (!canFetch) return null

  async function handleDialogSubmit(
    payload: Parameters<typeof workflowActions.submit>[0],
  ) {
    const ok = await workflowActions.submit(payload)
    if (ok) {
      showToast(payload.mode === 'create' ? 'Approval workflow created.' : 'Approval workflow updated.')
    }
  }

  async function handleDeactivate() {
    const ok = await workflowActions.confirmDeactivate()
    if (ok) {
      showToast('Approval workflow deactivated.')
    } else if (workflowActions.saveError) {
      showToast(workflowActions.saveError)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-hrms-border pb-3">
          <CardTitle className="text-base font-semibold text-hrms-navy">Approval workflows</CardTitle>
          {canManage ? (
            <Button type="button" size="sm" onClick={workflowActions.openCreate}>
              Add workflow
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3 p-0 text-sm">
          <p className="px-5 pt-4 text-xs text-hrms-text-muted">
            Multi-level approval chains used when employees request leave. Managed on the server.
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
                    <th className={leaveThClass('left', 'w-[18%]')}>Workflow</th>
                    <th className={leaveThClass('left', 'w-[10%]')}>Leave type</th>
                    <th className={leaveThClass('left', 'w-[32%]')}>Steps</th>
                    <th className={leaveThClass('left', 'w-[10%]')}>Status</th>
                    <th className={leaveThClass('right', canManage ? 'w-[20%]' : 'w-[10%]')}>Actions</th>
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
                        {row.leaveTypeCode === '—' ? (
                          <span className="text-hrms-text-secondary">All / default</span>
                        ) : row.leaveTypeCode === 'MULTI' ? (
                          <span className="text-hrms-text-secondary">Multiple types</span>
                        ) : row.leaveTypeCode.includes(',') ? (
                          <span className="text-sm text-hrms-navy">{row.leaveTypeCode}</span>
                        ) : (
                          <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
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
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <RowLinkButton onClick={() => setDetailRow(row)}>View</RowLinkButton>
                          {canManage ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className={cn(LEAVE_SECONDARY_BUTTON, 'h-8')}
                                onClick={() => workflowActions.openEdit(row.id)}
                              >
                                Edit
                              </Button>
                              {row.active ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-hrms-border text-hrms-danger hover:bg-red-50"
                                  onClick={() => workflowActions.openDeactivate(row.id)}
                                >
                                  Deactivate
                                </Button>
                              ) : null}
                            </>
                          ) : null}
                        </div>
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
        leaveTypes={leaveTypes}
        employees={employees}
        onOpenChange={(open) => !open && setDetailRow(null)}
        useLiveApi={canFetch}
      />
      <ApiApprovalWorkflowDialog
        open={workflowActions.dialog != null}
        mode={workflowActions.dialog?.mode ?? 'create'}
        workflowId={workflowActions.dialog?.id ?? null}
        leaveTypes={leaveTypes}
        employees={snapshot?.employees ?? []}
        saveError={workflowActions.saveError}
        loading={workflowActions.busy}
        canFetchDetail={canManage}
        onOpenChange={(open) => !open && workflowActions.closeDialog()}
        onClearSaveError={workflowActions.clearSaveError}
        onSubmit={(payload) => void handleDialogSubmit(payload)}
      />
      <LeaveConfirmDialog
        open={workflowActions.deactivateId != null}
        onOpenChange={(open) => !open && workflowActions.openDeactivate(null)}
        title="Deactivate approval workflow?"
        description={
          deactivateTarget
            ? `${deactivateTarget.name} will be deactivated. Existing in-flight requests keep their current chain.`
            : 'This workflow will be deactivated on the server.'
        }
        confirmLabel="Deactivate"
        loading={workflowActions.busy}
        danger
        onConfirm={() => void handleDeactivate()}
      />
    </>
  )
}