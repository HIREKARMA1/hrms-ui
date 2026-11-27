import { describe, expect, it } from 'vitest'

import { mapLeaveType } from '../api/leaveMappers'

import { mapApiApprovalWorkflowItemToTableRow, resolveLeaveTypeCodeFromIds } from './mapApiApprovalWorkflows'

const catalog = [
  mapLeaveType({
    id: 'cmww0whvu001z0pqhhl94zabc',
    code: 'CASUAL',
    name: 'Casual Leave',
    description: null,
    isPaid: true,
    isActive: true,
    requiresApproval: true,
    maxAllowedDays: null,
    requestCount: 0,
    balanceCount: 0,
  })!,
]

describe('mapApiApprovalWorkflows leave type labels', () => {
  it('resolves catalog code instead of id prefix', () => {
    expect(
      resolveLeaveTypeCodeFromIds(['cmww0whvu001z0pqhhl94zabc'], catalog),
    ).toBe('CASUAL')
  })

  it('maps table row with leave type catalog', () => {
    const row = mapApiApprovalWorkflowItemToTableRow(
      { id: 'wf-1', name: 'Test', leaveTypeIds: ['cmww0whvu001z0pqhhl94zabc'] },
      catalog,
    )
    expect(row.leaveTypeCode).toBe('CASUAL')
  })
})