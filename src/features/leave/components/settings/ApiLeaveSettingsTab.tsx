/**
 * Server Leave Settings: leave type catalog CRUD (GET/POST/PATCH/DELETE
 * /leave-types) and read-only entitlement defaults.
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  getLeaveErrorMessage,
  useCreateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useListLeavePolicyDefaultsQuery,
  useUpdateLeaveTypeMutation,
} from '../../api/leaveApi'
import { formatLeaveTypeSaveError } from '../../utils/formatLeaveTypeSaveError'
import type { CreateLeaveTypeBody, UpdateLeaveTypeBody } from '../../api/leaveApi.types'
import type { LeaveTypeOption } from '../../api/leaveMappers'
import { useLeave } from '../../hooks/useLeave'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveConfirmDialog } from '../shared/LeaveConfirmDialog'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LeaveInlineLoading, LeaveServerNotice } from '../shared/LeaveServerNotice'
import { LEAVE_SECONDARY_BUTTON, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { ApiLeaveTypeDialog, type ApiLeaveTypeDialogMode } from './ApiLeaveTypeDialog'
import { ApprovalWorkflowsLiveTable } from './ApprovalWorkflowsLiveTable'

const TH = 'px-3 py-2 font-semibold'
const TD = 'px-3 py-2'

export function ApiLeaveSettingsTab() {
  const { snapshot, reload } = useLeave()
  const { showToast } = useLeaveToast()
  const permissions = useLeavePermissions()
  const canManage = permissions.canUpdateLeaveTypes
  const defaults = useListLeavePolicyDefaultsQuery(undefined, { skip: !permissions.canViewPolicyDefaults })
  const types = snapshot?.api?.leaveTypes ?? []

  const [createLeaveType] = useCreateLeaveTypeMutation()
  const [updateLeaveType] = useUpdateLeaveTypeMutation()
  const [deleteLeaveType] = useDeleteLeaveTypeMutation()

  const [dialog, setDialog] = useState<{ mode: ApiLeaveTypeDialogMode; type: LeaveTypeOption | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LeaveTypeOption | null>(null)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleDialogSubmit(payload: {
    mode: ApiLeaveTypeDialogMode
    id?: string
    body: CreateLeaveTypeBody | UpdateLeaveTypeBody
  }) {
    setBusy(true)
    setSaveError(null)
    try {
      if (payload.mode === 'create') {
        await createLeaveType(payload.body as CreateLeaveTypeBody).unwrap()
        showToast('Leave type created.')
      } else if (payload.id) {
        await updateLeaveType({ id: payload.id, body: payload.body as UpdateLeaveTypeBody }).unwrap()
        showToast('Leave type updated.')
      }
      setDialog(null)
      await reload()
    } catch (error) {
      const message = formatLeaveTypeSaveError(error)
      setSaveError(message)
      showToast('Could not save the leave type. See the message in the dialog.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await deleteLeaveType(deleteTarget.id).unwrap()
      showToast(deleteTarget.isActive ? 'Leave type deactivated.' : 'Leave type removed.')
      setDeleteTarget(null)
      await reload()
    } catch (error) {
      showToast(getLeaveErrorMessage(error, 'Could not deactivate the leave type.'))
    } finally {
      setBusy(false)
    }
  }

  const deleteDescription = deleteTarget
    ? deleteTarget.requestCount > 0 || deleteTarget.balanceCount > 0
      ? `${deleteTarget.name} (${deleteTarget.code}) has ${deleteTarget.requestCount} request(s) and ${deleteTarget.balanceCount} balance row(s). The server may deactivate it instead of deleting.`
      : `Remove ${deleteTarget.name} (${deleteTarget.code}) from the catalog?`
    : ''

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Leave settings" subtitle="Manage leave types on the server and review entitlement defaults." />
      <LeaveServerNotice>
        Leave types and approval workflows are saved to the server. Holidays, team coverage and notice rules are not stored here yet.
      </LeaveServerNotice>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-hrms-border pb-3">
          <CardTitle className="text-base font-semibold text-hrms-navy">Leave types</CardTitle>
          {canManage ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setSaveError(null)
                setDialog({ mode: 'create', type: null })
              }}
            >
              Add leave type
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto p-0">
          {types.length === 0 ? (
            <LeaveEmptyState message="No leave types are configured." />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  {['Code', 'Name', 'Paid', 'Approval', 'Max days', 'Requests', 'Balances', 'Status', ...(canManage ? ['Actions'] : [])].map(
                    (head) => (
                      <th key={head} className={TH}>
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr key={type.id} className="border-b border-hrms-border/40">
                    <td className={`${TD} font-semibold text-hrms-navy`}>{type.code}</td>
                    <td className={TD}>
                      {type.name}
                      {type.description ? <span className="block text-hrms-text-muted">{type.description}</span> : null}
                    </td>
                    <td className={TD}>{type.isPaid ? 'Paid' : 'Unpaid'}</td>
                    <td className={TD}>{type.requiresApproval ? 'Required' : 'Auto'}</td>
                    <td className={`${TD} tabular-nums`}>{type.maxAllowedDays ?? 'No limit'}</td>
                    <td className={`${TD} tabular-nums`}>{type.requestCount}</td>
                    <td className={`${TD} tabular-nums`}>{type.balanceCount}</td>
                    <td className={TD}>{type.isActive ? 'Active' : 'Inactive'}</td>
                    {canManage ? (
                      <td className={TD}>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={cn(LEAVE_SECONDARY_BUTTON, 'h-8')}
                            onClick={() => {
                              setSaveError(null)
                              setDialog({ mode: 'edit', type })
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 border-hrms-border text-hrms-danger hover:bg-red-50"
                            onClick={() => setDeleteTarget(type)}
                          >
                            {type.isActive ? 'Deactivate' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <ApprovalWorkflowsLiveTable leaveTypes={types} />
      {permissions.canViewPolicyDefaults ? (
        <Card>
          <CardHeader className="border-b border-hrms-border pb-3">
            <CardTitle className="text-base font-semibold text-hrms-navy">Entitlement defaults</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 overflow-x-auto p-0">
            {defaults.isFetching && !defaults.data ? (
              <div className="px-5">
                <LeaveInlineLoading label="Loading entitlement defaults…" />
              </div>
            ) : defaults.isError && !defaults.data ? (
              <LeaveErrorState
                message={getLeaveErrorMessage(defaults.error, 'Could not load entitlement defaults.')}
                onRetry={() => void defaults.refetch()}
              />
            ) : !defaults.data || defaults.data.length === 0 ? (
              <LeaveEmptyState message="No entitlement defaults are configured." />
            ) : (
              <table className="w-full text-left text-xs">
                <thead className={LEAVE_TABLE_THEAD}>
                  <tr>
                    {['Leave type', 'Annual entitlement', 'Monthly accrual', 'Grant mode', 'Status'].map((head) => (
                      <th key={head} className={TH}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {defaults.data.map((item) => (
                    <tr key={item.id} className="border-b border-hrms-border/40">
                      <td className={TD}>
                        {item.leaveTypeName} ({item.leaveTypeCode})
                      </td>
                      <td className={`${TD} tabular-nums`}>{item.annualEntitlement}</td>
                      <td className={`${TD} tabular-nums`}>{item.monthlyAccrualAmount}</td>
                      <td className={TD}>{item.grantMode === 'MONTHLY_ACCRUAL' ? 'Monthly accrual' : 'Annual grant'}</td>
                      <td className={TD}>{item.isActive ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      ) : null}
      <ApiLeaveTypeDialog
        open={dialog != null}
        mode={dialog?.mode ?? 'create'}
        initial={dialog?.type ?? null}
        saveError={saveError}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null)
            setSaveError(null)
          }
        }}
        onSubmit={(payload) => void handleDialogSubmit(payload)}
        loading={busy}
      />
      <LeaveConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget?.isActive ? 'Deactivate leave type?' : 'Delete leave type?'}
        description={deleteDescription}
        confirmLabel={deleteTarget?.isActive ? 'Deactivate' : 'Delete'}
        loading={busy}
        danger
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}