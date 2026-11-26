/**
 * Form state and API detail hydration for ApiApprovalWorkflowDialog.
 */

import { useEffect, useMemo, useState } from 'react'

import { useGetApprovalWorkflowByIdQuery } from '../../../api/leaveApprovalApi'
import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type {
  CreateApprovalWorkflowBody,
  UpdateApprovalWorkflowBody,
} from '../../../types/api/leaveApprovalWorkflows.types'
import { approvalWorkflowFormFromDetail } from '../../../utils/approvalWorkflowFormFromDetail'
import {
  buildCreateApprovalWorkflowBody,
  buildUpdateApprovalWorkflowBody,
  defaultApprovalWorkflowForm,
  type ApprovalWorkflowForm,
  type ApprovalWorkflowFormStep,
} from '../../../utils/buildApprovalWorkflowApiBody'
import { activeLeaveTypesForWorkflow, findLeaveTypeOption } from '../../../utils/workflowLeaveTypeOptions'
import { workflowFormSelfApprovalWarnings } from '../../../utils/workflowSelfApproval'
import type { ApiApprovalWorkflowDialogMode } from '../ApiApprovalWorkflowDialog'

function defaultStep(): ApprovalWorkflowFormStep {
  return { assigneeType: 'ANY_PROCESSOR', employeeIds: [], departmentId: '' }
}

export function useApiApprovalWorkflowDialogState(
  open: boolean,
  mode: ApiApprovalWorkflowDialogMode,
  workflowId: string | null,
  leaveTypes: LeaveTypeOption[],
  canFetchDetail: boolean,
  onSubmit: (payload: {
    mode: ApiApprovalWorkflowDialogMode
    id?: string
    body: CreateApprovalWorkflowBody | UpdateApprovalWorkflowBody
  }) => void,
  onClearSaveError?: () => void,
) {
  const [form, setForm] = useState<ApprovalWorkflowForm>(defaultApprovalWorkflowForm())
  const [localError, setLocalError] = useState<string | null>(null)

  const shouldFetch = Boolean(open && mode === 'edit' && canFetchDetail && workflowId)
  const { data: liveDetail, isFetching: detailLoading } = useGetApprovalWorkflowByIdQuery(workflowId ?? '', {
    skip: !shouldFetch,
  })

  useEffect(() => {
    if (!open) {
      setForm(defaultApprovalWorkflowForm())
      setLocalError(null)
      return
    }
    if (mode === 'create') {
      setForm(defaultApprovalWorkflowForm())
      setLocalError(null)
      return
    }
    if (liveDetail) {
      setForm(approvalWorkflowFormFromDetail(liveDetail))
    }
  }, [liveDetail, mode, open])

  function patchStep(index: number, patch: Partial<ApprovalWorkflowFormStep>) {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? { ...step, ...patch } : step)),
    }))
    onClearSaveError?.()
    setLocalError(null)
  }

  function addStep() {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, defaultStep()] }))
  }

  function removeStep(index: number) {
    setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }))
  }

  function toggleEmployee(index: number, employeeId: string) {
    const step = form.steps[index]
    if (!step) return
    const has = step.employeeIds.includes(employeeId)
    patchStep(index, {
      employeeIds: has ? step.employeeIds.filter((id) => id !== employeeId) : [...step.employeeIds, employeeId],
    })
  }

  const activeLeaveTypes = useMemo(() => activeLeaveTypesForWorkflow(leaveTypes), [leaveTypes])
  const selectedLeaveType = findLeaveTypeOption(leaveTypes, form.leaveTypeId)
  const leaveTypeInactive = Boolean(selectedLeaveType && !selectedLeaveType.isActive)
  const selfApprovalWarnings = useMemo(() => workflowFormSelfApprovalWarnings(form), [form])

  function handleSubmit() {
    const built =
      mode === 'create'
        ? buildCreateApprovalWorkflowBody(form, leaveTypes)
        : buildUpdateApprovalWorkflowBody(form, leaveTypes)
    if (!built.ok) {
      setLocalError(built.error)
      return
    }
    onSubmit({
      mode,
      id: mode === 'edit' ? workflowId ?? undefined : undefined,
      body: built.body,
    })
  }

  function clearErrors() {
    onClearSaveError?.()
    setLocalError(null)
  }

  return {
    form,
    setForm,
    localError,
    detailLoading,
    activeLeaveTypes,
    selectedLeaveType,
    leaveTypeInactive,
    selfApprovalWarnings,
    patchStep,
    addStep,
    removeStep,
    toggleEmployee,
    handleSubmit,
    clearErrors,
  }
}