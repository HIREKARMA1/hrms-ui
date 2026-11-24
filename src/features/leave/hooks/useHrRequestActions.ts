/**
 * HR request actions: apply on behalf and cancel. Server snapshots call the
 * leave API; the demo store keeps its ledger rules.
 */

import type { ApplyLeaveSubmitInput } from '../components/applyLeave/ApplyLeaveDialog'
import type { LeaveSnapshot } from '../services/leaveService'
import { addRequest, cancelRequest, nextRequestId } from '../services/leaveService'
import type { LeaveViewer } from '../types/viewer'
import type { LeaveEmployee } from '../types/employee'
import { getApprovalChain } from '../utils/getApprovalChain'
import { leaveTodayIso } from '../utils/leaveToday'
import { useLeaveApiActions, type LeaveActionResult } from './useLeaveApiActions'

const OK: LeaveActionResult = { ok: true }

export function useHrRequestActions(snapshot: LeaveSnapshot | null, viewer: LeaveViewer, reload: () => Promise<void>) {
  const server = useLeaveApiActions()

  async function applyOnBehalf(
    employee: LeaveEmployee,
    input: ApplyLeaveSubmitInput & { days?: number },
  ): Promise<LeaveActionResult> {
    if (!snapshot) return { ok: false, message: 'Leave data is not loaded yet.' }
    if (snapshot.api) {
      return server.apply(
        {
          employeeId: employee.id,
          leaveTypeCode: input.leaveTypeCode,
          fromDate: input.fromDate,
          toDate: input.toDate,
          reason: input.reason,
          portion: input.portion,
        },
        snapshot.api.leaveTypes,
      )
    }
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
          actorId: viewer.actorId,
          actorName: viewer.displayName,
          onBehalfOfId: employee.id,
          onBehalfOfName: employee.name,
          comment: `Applied by ${viewer.displayName} on behalf`,
        },
      ],
    })
    await reload()
    return OK
  }

  async function hrCancel(requestId: string, reason: string): Promise<LeaveActionResult> {
    if (snapshot?.api) return server.cancel(requestId, reason)
    cancelRequest(requestId, viewer.actorId, viewer.displayName, reason)
    await reload()
    return OK
  }

  return { applyOnBehalf, hrCancel }
}
