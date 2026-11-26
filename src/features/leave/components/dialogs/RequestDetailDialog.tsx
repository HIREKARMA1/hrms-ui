/**
 * Leave request details dialog with facts grid, timeline, and role-based footer actions.
 */

import * as Dialog from '@radix-ui/react-dialog'
import { FileText } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetApprovalWorkflowsQuery, useGetLeaveApprovalHistoryQuery } from '../../api/leaveApprovalApi'
import { useGetLeaveQuery } from '../../api/leaveApi'
import { useLeave } from '../../hooks/useLeave'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { RequestTimeline } from '../RequestTimeline'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { leaveWorkflowApprovalNotice } from '../../utils/leaveWorkflowApproval'
import { findActiveWorkflowForLeaveType, workflowSelfApprovalRequestNotice } from '../../utils/workflowSelfApproval'
import { RequestDetailSummary } from './RequestDetailSummary'

type RequestDetailDialogProps = {
  open: boolean
  request: LeaveRequest | null
  employeeName?: string
  /** Null when no ledger balance is known; the summary then shows the paid / loss-of-pay split. */
  balanceBefore: number | null
  balanceAfter: number | null
  onOpenChange: (open: boolean) => void
  canApprove?: boolean
  canReject?: boolean
  onApprove?: () => void
  onReject?: () => void
  /** When true (My Leave + API list), loads GET /leaves/{id} while open. */
  useLiveApi?: boolean
  /** When true, loads GET /leave-approval/history/{id} for Activity while open. */
  useLiveApprovalHistory?: boolean
}

export function RequestDetailDialog({
  open,
  request,
  employeeName,
  balanceBefore,
  balanceAfter,
  onOpenChange,
  canApprove,
  canReject,
  onApprove,
  onReject,
  useLiveApi = false,
  useLiveApprovalHistory = false,
}: RequestDetailDialogProps) {
  const { snapshot } = useLeave()
  const employees = snapshot?.employees ?? []
  const canFetchLeaves = useShouldFetchLeaveList()
  const shouldFetchDetail = Boolean(open && useLiveApi && canFetchLeaves && request?.id)
  const shouldFetchHistory = Boolean(
    open && useLiveApprovalHistory && canFetchLeaves && request?.id,
  )
  const requestId = request?.id ?? ''
  const {
    data: liveRequest,
    isError: detailIsError,
    error: detailError,
    isFetching: detailFetching,
  } = useGetLeaveQuery(requestId, { skip: !shouldFetchDetail })
  const {
    data: liveHistorySteps,
    isError: historyIsError,
    error: historyError,
    isFetching: historyFetching,
  } = useGetLeaveApprovalHistoryQuery(requestId, { skip: !shouldFetchHistory })

  const shouldFetchWorkflows = Boolean(
    open &&
      canFetchLeaves &&
      useLiveApi &&
      request?.status === 'Pending' &&
      request.multiLevelWorkflow,
  )
  const { data: workflowList } = useGetApprovalWorkflowsQuery(undefined, {
    skip: !shouldFetchWorkflows,
  })

  const displayRequest =
    shouldFetchDetail && liveRequest && !detailIsError ? liveRequest : request

  const workflowForRequest = useMemo(() => {
    if (!displayRequest) return null
    return findActiveWorkflowForLeaveType(workflowList, displayRequest.leaveTypeCode, [], employees)
  }, [displayRequest, employees, workflowList])

  if (!displayRequest) return null

  const detailErrorMessage =
    shouldFetchDetail && detailIsError
      ? getApiErrorMessage(detailError, 'Could not load full request details. Showing list data.')
      : null

  const historyErrorMessage =
    shouldFetchHistory && historyIsError
      ? getApiErrorMessage(historyError, 'Could not load approval history. Showing cached steps.')
      : null

  const activitySteps =
    shouldFetchHistory && liveHistorySteps && !historyIsError && liveHistorySteps.length > 0
      ? liveHistorySteps
      : displayRequest.steps

  const title = employeeName ?? 'Request details'
  const subtitle = requestSubtitle(displayRequest, employeeName)
  const viewerCanAct = Boolean((canApprove || canReject) && (onApprove || onReject))
  const selfApprovalNotice = workflowSelfApprovalRequestNotice(
    displayRequest,
    workflowForRequest,
    employeeName,
  )
  const workflowNotice =
    selfApprovalNotice ?? leaveWorkflowApprovalNotice(displayRequest, viewerCanAct)
  const blockedSelfApproval = Boolean(selfApprovalNotice)
  const showActions =
    !blockedSelfApproval && Boolean((canApprove && onApprove) || (canReject && onReject))

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="lg">
        <LeaveDialogHeader title={title} subtitle={subtitle} icon={FileText}>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <LeaveTypeChip code={displayRequest.leaveTypeCode} />
            <LeaveStatusPill status={displayRequest.currentStepLabel} />
            {displayRequest.escalated ? <LeaveStatusPill status="Escalated" /> : null}
          </div>
        </LeaveDialogHeader>
        <LeaveDialogBody className="space-y-5">
          {detailErrorMessage ? (
            <p
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
              role="alert"
            >
              {detailErrorMessage}
            </p>
          ) : null}
          {detailFetching && shouldFetchDetail ? (
            <p className="text-xs text-hrms-text-muted">Loading request details…</p>
          ) : null}
          {historyErrorMessage ? (
            <p
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
              role="alert"
            >
              {historyErrorMessage}
            </p>
          ) : null}
          {historyFetching && shouldFetchHistory ? (
            <p className="text-xs text-hrms-text-muted">Loading approval history…</p>
          ) : null}
          {workflowNotice ? (
            <p
              className={
                workflowNotice.tone === 'warning'
                  ? 'rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900'
                  : workflowNotice.tone === 'info'
                    ? 'rounded-lg border border-hrms-primary/20 bg-hrms-primary/5 px-4 py-2 text-sm text-hrms-navy'
                    : 'rounded-lg border border-hrms-border bg-hrms-muted-bg/60 px-4 py-2 text-sm text-hrms-text-secondary'
              }
              role={workflowNotice.tone === 'warning' ? 'alert' : 'status'}
            >
              {workflowNotice.message}
            </p>
          ) : null}
          <RequestDetailSummary
            request={displayRequest}
            balanceBefore={balanceBefore}
            balanceAfter={balanceAfter}
          />
          <section className="rounded-xl border border-hrms-border bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-hrms-text-muted">Activity</h3>
            <div className="mt-3">
              <RequestTimeline steps={activitySteps} />
            </div>
          </section>
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" className={LEAVE_SECONDARY_BUTTON}>
                Close
              </Button>
            </Dialog.Close>
            {showActions && canReject && onReject ? (
              <Button
                type="button"
                variant="outline"
                className="border-hrms-danger/25 text-hrms-danger hover:bg-hrms-danger/5"
                onClick={onReject}
              >
                Reject
              </Button>
            ) : null}
            {showActions && canApprove && onApprove ? (
              <Button type="button" onClick={onApprove}>
                Approve
              </Button>
            ) : null}
          </div>
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}

function requestSubtitle(request: LeaveRequest, employeeName?: string) {
  const applied = `Applied ${formatDate(request.appliedOn)}`
  const duration = `${request.days} day${request.days === 1 ? '' : 's'}`
  const id = `Ref ${request.id}`
  if (employeeName) return `Leave request · ${applied} · ${duration} · ${id}`
  return `${applied} · ${duration} · ${id}`
}
