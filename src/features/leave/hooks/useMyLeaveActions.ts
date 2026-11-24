/**
 * Apply and cancel leave request handlers for My Leave tab.
 * Server snapshots post to the leave API for the viewer's linked employee.
 * Keeps MyLeaveTab.tsx under the line limit.
 */

import type { ApplyLeaveSubmitInput } from '../components/applyLeave/ApplyLeaveDialog'
import type { LeaveSnapshot } from '../services/leaveService'
import { addRequest, cancelRequest, nextRequestId } from '../services/leaveService'
import type { LinkedLeaveViewer } from '../types/viewer'
import type { LeaveRequest } from '../types/leaveRequest'
import type { LeaveEmployee } from '../types/employee'
import { getApprovalChain } from '../utils/getApprovalChain'
import { leaveTodayIso } from '../utils/leaveToday'
import { useLeaveApiActions, type LeaveActionResult } from './useLeaveApiActions'

const OK: LeaveActionResult = { ok: true }

export function useMyLeaveActions(
  snapshot: LeaveSnapshot | null,
  viewer: LinkedLeaveViewer,
  employee: LeaveEmployee | undefined,
  reload: () => Promise<void>,
) {
  const server = useLeaveApiActions()

  async function handleCancel(row: LeaveRequest): Promise<LeaveActionResult> {
    if (snapshot?.api) return server.cancel(row.id, 'Cancelled by employee')
    // Payroll may need a correction if payroll for this month was already processed.
    cancelRequest(row.id, viewer.actorId, viewer.displayName, 'Cancelled by employee')
    await reload()
    return OK
  }

  async function handleApply(input: ApplyLeaveSubmitInput): Promise<LeaveActionResult> {
    if (!snapshot || !employee) return { ok: false, message: 'Leave data is not loaded yet.' }
    if (snapshot.api) {
      return server.apply(
        {
          employeeId: viewer.employeeId,
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
    return OK
  }

  return { handleCancel, handleApply }
}
