/**
 * Create or edit approval workflows (leave settings).
 */

import { GitBranchPlus } from 'lucide-react'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import type {
  CreateApprovalWorkflowBody,
  UpdateApprovalWorkflowBody,
} from '../../types/api/leaveApprovalWorkflows.types'
import type { LeaveEmployee } from '../../types/employee'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { WorkflowSelfApprovalCallout } from '../shared/WorkflowSelfApprovalCallout'
import { ApprovalWorkflowMetaFields } from './approvalWorkflow/ApprovalWorkflowMetaFields'
import { ApprovalWorkflowStepsList } from './approvalWorkflow/ApprovalWorkflowStepsList'
import { useApiApprovalWorkflowDialogState } from './approvalWorkflow/useApiApprovalWorkflowDialogState'

export type ApiApprovalWorkflowDialogMode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: ApiApprovalWorkflowDialogMode
  workflowId: string | null
  leaveTypes: LeaveTypeOption[]
  employees?: LeaveEmployee[]
  saveError?: string | null
  loading?: boolean
  canFetchDetail?: boolean
  onOpenChange: (open: boolean) => void
  onClearSaveError?: () => void
  onSubmit: (payload: {
    mode: ApiApprovalWorkflowDialogMode
    id?: string
    body: CreateApprovalWorkflowBody | UpdateApprovalWorkflowBody
  }) => void
}

export function ApiApprovalWorkflowDialog({
  open,
  mode,
  workflowId,
  leaveTypes,
  employees = [],
  saveError,
  loading,
  canFetchDetail = false,
  onOpenChange,
  onClearSaveError,
  onSubmit,
}: Props) {
  const vm = useApiApprovalWorkflowDialogState(open, mode, workflowId, leaveTypes, canFetchDetail, onSubmit, onClearSaveError)
  const error = vm.localError ?? saveError

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md">
        <LeaveDialogHeader
          title={mode === 'create' ? 'Add approval workflow' : 'Edit approval workflow'}
          subtitle="Each level uses an assignee type from the server (processor queue, department, or named employees)."
          icon={GitBranchPlus}
        />
        <LeaveDialogBody className="space-y-4">
          {vm.detailLoading && mode === 'edit' ? (
            <p className="text-xs text-hrms-text-muted">Loading workflow…</p>
          ) : null}
          {error ? (
            <p className="rounded-lg border border-hrms-danger/20 bg-hrms-danger/5 px-3 py-2 text-xs text-hrms-danger">
              {error}
            </p>
          ) : null}
          <WorkflowSelfApprovalCallout messages={vm.selfApprovalWarnings} />
          <ApprovalWorkflowMetaFields
            form={vm.form}
            activeLeaveTypes={vm.activeLeaveTypes}
            selectedLeaveType={vm.selectedLeaveType}
            leaveTypeInactive={vm.leaveTypeInactive}
            onFormChange={(patch) => vm.setForm((prev) => ({ ...prev, ...patch }))}
            onClearErrors={vm.clearErrors}
          />
          <ApprovalWorkflowStepsList
            form={vm.form}
            employees={employees}
            onAddStep={vm.addStep}
            onRemoveStep={vm.removeStep}
            onPatchStep={vm.patchStep}
            onToggleEmployee={vm.toggleEmployee}
          />
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions
            primaryLabel={mode === 'create' ? 'Create workflow' : 'Save changes'}
            loading={loading}
            onPrimary={vm.handleSubmit}
          />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}