import { describe, expect, it } from 'vitest'

import type { ApprovalWorkflowStepView } from '../types/api/leaveApprovalWorkflows.types'

import { describeWorkflowStepLabel, enrichWorkflowStepViews } from './approvalWorkflowStepLabels'

describe('approvalWorkflowStepLabels', () => {
  it('names explicit approvers', () => {
    const step: ApprovalWorkflowStepView = {
      order: 1,
      label: 'L1: Named employees',
      assigneeType: 'EXPLICIT_EMPLOYEES',
      employeeIds: ['emp-1'],
    }
    expect(
      describeWorkflowStepLabel(step, [{ id: 'emp-1', name: 'Nitish Kumar Nanda' } as never]),
    ).toBe('Level 1: Nitish Kumar Nanda')
  })

  it('enriches step list for display', () => {
    const enriched = enrichWorkflowStepViews(
      [
        {
          order: 1,
          label: 'old',
          assigneeType: 'ANY_PROCESSOR',
        },
      ],
      [],
    )
    expect(enriched[0].label).toContain('Any processor')
  })
})