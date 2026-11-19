/**
 * Apply and cancel leave request handlers for My Leave tab.
 * Keeps MyLeaveTab.tsx under the line limit.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { addRequest, cancelRequest, nextRequestId } from '../services/leaveService'
import type { LinkedLeaveViewer } from '../types/viewer'
import type { LeaveRequest } from '../types/leaveRequest'
import type { LeaveEmployee } from '../types/employee'
import { getApprovalChain } from '../utils/getApprovalChain'
import { leaveTodayIso } from '../utils/leaveToday'

export function useMyLeaveActions(
  snapshot: LeaveSnapshot | null,
  viewer: LinkedLeaveViewer,
  employee: LeaveEmployee | undefined,
  reload: () => Promise<void>,
) {
  async function handleCancel(row: LeaveRequest) {
    // Payroll may need a correction if payroll for this month was already processed.
    cancelRequest(row.id, viewer.actorId, viewer.displayName, 'Cancelled by employee')
    await reload()
  }

  async function handleApply(input: {
    leaveTypeCode: string
    fromDate: string
    toDate: string
    reason: string
    attachmentName?: string
    convertExtraToLwp?: boolean
  }) {
    if (!snapshot || !employee) {
      return
    }
    const policy = snapshot.settings.leaveTypes.find((item) => item.code === input.leaveTypeCode)!
    const byId = Object.fromEntries(snapshot.employees.map((item) => [item.id, item]))
    const chain = getApprovalChain(policy, employee, byId, 1)
    const first = chain[0]
    addRequest({
      id: nextRequestId(),
      employeeId: viewer.employeeId,
      leaveTypeCode: input.leaveTypeCode,
      fromDate: input.fromDate,
      toDate: input.toDate,
      days: 1,
      segments: [],
      reason: input.reason,
      attachmentName: input.attachmentName,
      appliedOn: leaveTodayIso(),
      status: 'Pending',
      currentLevel: first?.level ?? 'HR',
      currentStepLabel: `Pending: ${first?.label ?? 'HR'}`,
      escalated: false,
      convertedToLwp: input.convertExtraToLwp,
      steps: [
        {
          id: `ST-${Date.now()}`,
          kind: 'applied',
          at: leaveTodayIso(),
          actorId: viewer.actorId,
          actorName: viewer.displayName,
        },
      ],
    })
    await reload()
  }

  return { handleCancel, handleApply }
}
