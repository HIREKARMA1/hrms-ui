/**
 * HR request actions: apply on behalf, approve, reject, cancel with ledger rules.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { addRequest, cancelRequest, nextRequestId } from '../services/leaveService'
import type { LeaveViewer } from '../types/viewer'
import type { LeaveEmployee } from '../types/employee'
import { getApprovalChain } from '../utils/getApprovalChain'
import { leaveTodayIso } from '../utils/leaveToday'

export function useHrRequestActions(snapshot: LeaveSnapshot | null, viewer: LeaveViewer, reload: () => Promise<void>) {
  async function applyOnBehalf(
    employee: LeaveEmployee,
    input: { leaveTypeCode: string; fromDate: string; toDate: string; reason: string; attachmentName?: string; convertExtraToLwp?: boolean; days?: number },
  ) {
    if (!snapshot) return
    const policy = snapshot.settings.leaveTypes.find((item) => item.code === input.leaveTypeCode)!
    const byId = Object.fromEntries(snapshot.employees.map((item) => [item.id, item]))
    const chain = getApprovalChain(policy, employee, byId, input.days ?? 1)
    const first = chain[0]
    addRequest({
      id: nextRequestId(),
      employeeId: employee.id,
      leaveTypeCode: input.leaveTypeCode,
      fromDate: input.fromDate,
      toDate: input.toDate,
      days: input.days ?? 1,
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
          actorId: viewer.employeeId,
          actorName: viewer.displayName,
          onBehalfOfId: employee.id,
          onBehalfOfName: employee.name,
          comment: `Applied by ${viewer.displayName} on behalf`,
        },
      ],
    })
    await reload()
  }

  async function hrCancel(requestId: string, reason: string) {
    cancelRequest(requestId, viewer.employeeId, viewer.displayName, reason)
    await reload()
  }

  return { applyOnBehalf, hrCancel }
}
