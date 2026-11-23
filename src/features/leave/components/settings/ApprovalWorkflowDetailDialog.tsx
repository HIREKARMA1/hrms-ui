/**
 * Approval workflow detail (GET /leave-approval/workflows/{id} while open).
 */

import * as Dialog from '@radix-ui/react-dialog'
import { GitBranch } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetApprovalWorkflowByIdQuery } from '../../api/leaveApprovalApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import type { ApprovalWorkflowTableRow } from '../../types/api/leaveApprovalWorkflows.types'
import { tableRowToApprovalWorkflowDetail } from '../../utils/mapApiApprovalWorkflows'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'

type ApprovalWorkflowDetailDialogProps = {
  open: boolean
  row: ApprovalWorkflowTableRow | null
  onOpenChange: (open: boolean) => void
  useLiveApi?: boolean
}

export function ApprovalWorkflowDetailDialog({
  open,
  row,
  onOpenChange,
  useLiveApi = false,
}: ApprovalWorkflowDetailDialogProps) {
  const canFetch = useShouldFetchLeaveList()
  const shouldFetchDetail = Boolean(open && useLiveApi && canFetch && row?.id)
  const {
    data: liveDetail,
    isError: detailIsError,
    error: detailError,
    isFetching: detailFetching,
  } = useGetApprovalWorkflowByIdQuery(row?.id ?? '', { skip: !shouldFetchDetail })

  const display =
    shouldFetchDetail && liveDetail && !detailIsError
      ? liveDetail
      : row
        ? tableRowToApprovalWorkflowDetail(row)
        : null

  if (!display) return null

  const detailErrorMessage =
    shouldFetchDetail && detailIsError
      ? getApiErrorMessage(detailError, 'Could not load full workflow. Showing list data.')
      : null

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md">
        <LeaveDialogHeader
          title={display.name}
          subtitle={`Workflow ref ${display.id}`}
          icon={GitBranch}
        >
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {display.leaveTypeCode !== '—' ? (
              <LeaveTypeChip code={display.leaveTypeCode} abbreviated />
            ) : null}
            <LeaveStatusPill status={display.active ? 'Active' : 'Inactive'} />
          </div>
        </LeaveDialogHeader>
        <LeaveDialogBody className="space-y-4">
          {detailErrorMessage ? (
            <p
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
              role="alert"
            >
              {detailErrorMessage}
            </p>
          ) : null}
          {detailFetching && shouldFetchDetail ? (
            <p className="text-xs text-hrms-text-muted">Loading workflow details…</p>
          ) : null}
          {display.description ? (
            <p className="text-sm text-hrms-text-secondary">{display.description}</p>
          ) : null}
          <section className="rounded-xl border border-hrms-border bg-hrms-muted-bg/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-hrms-text-muted">
              Approval steps
            </h3>
            {display.steps.length === 0 ? (
              <p className="mt-2 text-sm text-hrms-text-secondary">No steps returned.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {display.steps.map((step) => (
                  <li key={`${step.order}-${step.label}`} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lavender text-xs font-semibold text-hrms-primary">
                      {step.order}
                    </span>
                    <span className="pt-0.5 text-hrms-navy">{step.label}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <Dialog.Close asChild>
            <Button type="button" variant="outline" className={LEAVE_SECONDARY_BUTTON}>
              Close
            </Button>
          </Dialog.Close>
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}