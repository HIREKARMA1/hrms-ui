import { describe, expect, it } from 'vitest'

import type { ApprovalWorkflowDetailView } from '../types/api/leaveApprovalWorkflows.types'
import type { LeaveRequest } from '../types/leaveRequest'
import {
  isApplicantNamedApproverAtCurrentLevel,
  parsePendingWorkflowLevel,
  workflowFormSelfApprovalWarnings,
  workflowSelfApprovalRequestNotice,
} from './workflowSelfApproval'
import { defaultApprovalWorkflowForm } from './buildApprovalWorkflowApiBody'

const workflow: ApprovalWorkflowDetailView = {
  id: 'wf-1',
  name: 'Test',
  leaveTypeCode: 'CL',
  stepsSummary: '',
  active: true,
  steps: [
    {
      order: 1,
      label: 'L1',
      assigneeType: 'EXPLICIT_EMPLOYEES',
      employeeIds: ['emp-nitish'],
    },
    { order: 2, label: 'HR', assigneeType: 'ANY_PROCESSOR' },
  ],
}

const request: LeaveRequest = {
  id: 'lr-1',
  employeeId: 'emp-nitish',
  employeeName: 'Nitish Kumar Nanda',
  leaveTypeCode: 'CL',
  fromDate: '2026-01-01',
  toDate: '2026-01-01',
  days: 1,
  segments: [],
  reason: 'test',
  appliedOn: '2026-01-01',
  status: 'Pending',
  currentLevel: null,
  currentStepLabel: 'Pending: level 1',
  escalated: false,
  multiLevelWorkflow: true,
  steps: [],
}

describe('workflowSelfApproval', () => {
  it('parses workflow level from step label', () => {
    expect(parsePendingWorkflowLevel('Pending: level 1')).toBe(1)
    expect(parsePendingWorkflowLevel('Approved')).toBeNull()
  })

  it('detects applicant named as current level approver', () => {
    expect(isApplicantNamedApproverAtCurrentLevel(request, workflow)).toBe(true)
    expect(
      isApplicantNamedApproverAtCurrentLevel(
        { ...request, employeeId: 'emp-other' },
        workflow,
      ),
    ).toBe(false)
  })

  it('returns a warning notice for self-approval risk', () => {
    const notice = workflowSelfApprovalRequestNotice(request, workflow)
    expect(notice?.tone).toBe('warning')
    expect(notice?.message).toMatch(/cannot approve their own/)
  })

  it('warns on workflow forms with explicit employees', () => {
    const form = defaultApprovalWorkflowForm()
    form.steps[0] = { assigneeType: 'EXPLICIT_EMPLOYEES', employeeIds: ['a'], departmentId: '' }
    const warnings = workflowFormSelfApprovalWarnings(form)
    expect(warnings.some((w) => w.includes('cannot approve their own'))).toBe(true)
  })
})