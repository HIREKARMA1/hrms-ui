/**
 * Approval level rows (assignee type, department, explicit employees).
 */

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { LeaveEmployee } from '../../../types/employee'
import type { WorkflowAssigneeType } from '../../../types/api/leaveApprovalWorkflows.types'
import {
  assigneeTypeLabel,
  assigneeTypeOptions,
  type ApprovalWorkflowForm,
  type ApprovalWorkflowFormStep,
} from '../../../utils/buildApprovalWorkflowApiBody'
import { LeaveDialogField } from '../../shared/LeaveDialogField'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_SELECT } from '../../shared/leaveUi'

type Props = {
  form: ApprovalWorkflowForm
  employees: LeaveEmployee[]
  onAddStep: () => void
  onRemoveStep: (index: number) => void
  onPatchStep: (index: number, patch: Partial<ApprovalWorkflowFormStep>) => void
  onToggleEmployee: (index: number, employeeId: string) => void
}

export function ApprovalWorkflowStepsList({
  form,
  employees,
  onAddStep,
  onRemoveStep,
  onPatchStep,
  onToggleEmployee,
}: Props) {
  const assigneeOptions = assigneeTypeOptions()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-hrms-text-muted">Approval levels</p>
        <Button type="button" size="sm" variant="outline" onClick={onAddStep}>
          Add level
        </Button>
      </div>
      {form.steps.map((step, index) => (
        <div key={`step-${index}`} className="space-y-2 rounded-lg border border-hrms-border bg-hrms-muted-bg/30 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-hrms-navy">Level {index + 1}</span>
            {form.steps.length > 1 ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => onRemoveStep(index)}>
                Remove
              </Button>
            ) : null}
          </div>
          <LeaveDialogField label="Assignee type" htmlFor={`wf-assignee-${index}`}>
            <select
              id={`wf-assignee-${index}`}
              className={cn(LEAVE_DIALOG_SELECT)}
              value={step.assigneeType}
              onChange={(event) =>
                onPatchStep(index, {
                  assigneeType: event.target.value as WorkflowAssigneeType,
                  employeeIds: [],
                  departmentId: '',
                })
              }
            >
              {assigneeOptions.map((type) => (
                <option key={type} value={type}>
                  {assigneeTypeLabel(type)}
                </option>
              ))}
            </select>
          </LeaveDialogField>
          {step.assigneeType === 'DEPARTMENT' ? (
            <LeaveDialogField label="Department id" htmlFor={`wf-dept-${index}`}>
              <input
                id={`wf-dept-${index}`}
                className={cn(LEAVE_DIALOG_INPUT)}
                placeholder="UUID from organisation / departments API"
                value={step.departmentId}
                onChange={(event) => onPatchStep(index, { departmentId: event.target.value })}
              />
            </LeaveDialogField>
          ) : null}
          {step.assigneeType === 'EXPLICIT_EMPLOYEES' ? (
            <div className="max-h-36 space-y-1 overflow-y-auto rounded-md border border-hrms-border bg-white p-2">
              {employees.length === 0 ? (
                <p className="text-xs text-hrms-text-muted">No employees in the leave directory snapshot.</p>
              ) : (
                employees.map((emp) => (
                  <label key={emp.id} className="flex cursor-pointer items-center gap-2 text-xs text-hrms-navy">
                    <input
                      type="checkbox"
                      checked={step.employeeIds.includes(emp.id)}
                      onChange={() => onToggleEmployee(index, emp.id)}
                    />
                    {emp.name}
                  </label>
                ))
              )}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}