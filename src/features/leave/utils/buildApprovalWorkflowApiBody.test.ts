import { describe, expect, it } from 'vitest'

import { buildCreateApprovalWorkflowBody, defaultApprovalWorkflowForm } from './buildApprovalWorkflowApiBody'

describe('buildCreateApprovalWorkflowBody', () => {
  it('sends leaveTypeIds and levels with assigneeType', () => {
    const form = {
      ...defaultApprovalWorkflowForm(),
      name: 'Processor chain',
      leaveTypeId: 'lt-casual',
      steps: [
        { assigneeType: 'ANY_PROCESSOR' as const, employeeIds: [], departmentId: '' },
        { assigneeType: 'ANY_PROCESSOR' as const, employeeIds: [], departmentId: '' },
      ],
    }
    const built = buildCreateApprovalWorkflowBody(form, [
      {
        id: 'lt-casual',
        code: 'CASUAL',
        name: 'Casual',
        description: null,
        isPaid: true,
        isActive: true,
        requiresApproval: true,
        maxAllowedDays: null,
        requestCount: 0,
        balanceCount: 0,
      },
    ])
    expect(built.ok).toBe(true)
    if (!built.ok) return
    expect(built.body).toEqual({
      name: 'Processor chain',
      isActive: true,
      leaveTypeIds: ['lt-casual'],
      levels: [
        { levelNumber: 1, assigneeType: 'ANY_PROCESSOR' },
        { levelNumber: 2, assigneeType: 'ANY_PROCESSOR' },
      ],
    })
    expect(built.body).not.toHaveProperty('steps')
    expect(built.body).not.toHaveProperty('leaveTypeId')
    expect(built.body.levels[0]).not.toHaveProperty('approverRole')
    expect(built.body.levels[0]).not.toHaveProperty('employeeIds')
  })

  it('requires a leave type', () => {
    const form = { ...defaultApprovalWorkflowForm(), name: 'Default chain' }
    const built = buildCreateApprovalWorkflowBody(form, [
      {
        id: 'lt-casual',
        code: 'CASUAL',
        name: 'Casual',
        description: null,
        isPaid: true,
        isActive: true,
        requiresApproval: true,
        maxAllowedDays: null,
        requestCount: 0,
        balanceCount: 0,
      },
    ])
    expect(built.ok).toBe(false)
    if (built.ok) return
    expect(built.error).toContain('leave type')
  })

  it('sends assigneeEmployeeIds for explicit levels', () => {
    const form = {
      ...defaultApprovalWorkflowForm(),
      name: 'Named approver',
      leaveTypeId: 'lt-casual',
      steps: [
        {
          assigneeType: 'EXPLICIT_EMPLOYEES' as const,
          employeeIds: ['emp-a'],
          departmentId: '',
        },
      ],
    }
    const built = buildCreateApprovalWorkflowBody(form, [
      {
        id: 'lt-casual',
        code: 'CASUAL',
        name: 'Casual',
        description: null,
        isPaid: true,
        isActive: true,
        requiresApproval: true,
        maxAllowedDays: null,
        requestCount: 0,
        balanceCount: 0,
      },
    ])
    expect(built.ok).toBe(true)
    if (!built.ok) return
    expect(built.body.levels[0]).toEqual({
      levelNumber: 1,
      assigneeType: 'EXPLICIT_EMPLOYEES',
      assigneeEmployeeIds: ['emp-a'],
    })
    expect(built.body.levels[0]).not.toHaveProperty('employeeIds')
  })

  it('includes departmentId for DEPARTMENT levels', () => {
    const form = {
      ...defaultApprovalWorkflowForm(),
      name: 'Dept level',
      leaveTypeId: 'lt-casual',
      steps: [{ assigneeType: 'DEPARTMENT' as const, employeeIds: [], departmentId: 'dept-1' }],
    }
    const built = buildCreateApprovalWorkflowBody(form, [
      {
        id: 'lt-casual',
        code: 'CASUAL',
        name: 'Casual',
        description: null,
        isPaid: true,
        isActive: true,
        requiresApproval: true,
        maxAllowedDays: null,
        requestCount: 0,
        balanceCount: 0,
      },
    ])
    expect(built.ok).toBe(true)
    if (!built.ok) return
    expect(built.body.levels[0]).toEqual({
      levelNumber: 1,
      assigneeType: 'DEPARTMENT',
      departmentId: 'dept-1',
    })
  })

  it('rejects inactive leave types before submit', () => {
    const form = {
      ...defaultApprovalWorkflowForm(),
      name: 'Inactive type',
      leaveTypeId: 'lt-sick',
    }
    const built = buildCreateApprovalWorkflowBody(form, [
      {
        id: 'lt-sick',
        code: 'SICK',
        name: 'Sick Leave',
        description: null,
        isPaid: true,
        isActive: false,
        requiresApproval: true,
        maxAllowedDays: null,
        requestCount: 0,
        balanceCount: 0,
      },
    ])
    expect(built.ok).toBe(false)
    if (built.ok) return
    expect(built.error).toContain('inactive')
  })
})