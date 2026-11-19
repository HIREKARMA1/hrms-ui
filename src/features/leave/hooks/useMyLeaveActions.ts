/**
 * Apply and cancel leave request handlers for My Leave tab.
 * POST /leaves when `leaves:create` and API employee id are available.
 */

import { getApiErrorMessage } from '@/services/api/errors'

import { useApplyLeaveMutation } from '../api/leaveApi'
import { useGetLeaveTypesQuery } from '../api/leaveTypesApi'
import type { LeaveSnapshot } from '../services/leaveService'
import { addRequest, cancelRequest, nextRequestId } from '../services/leaveService'
import type { ApplyLeaveFormInput } from '../types/api/leaveApply.types'
import type { LeaveViewer } from '../types/viewer'
import type { LeaveRequest } from '../types/leaveRequest'
import type { LeaveEmployee } from '../types/employee'
import { getApprovalChain } from '../utils/getApprovalChain'
import { leaveTodayIso } from '../utils/leaveToday'
import { liveApplyBlockedMessage } from '../utils/liveApplyBlockedMessage'
import { resolveLeaveTypeIdForCode } from '../utils/resolveLeaveTypeId'
import { useShouldApplyLeave } from './useShouldApplyLeave'

export type ApplyLeaveResult = { ok: true } | { ok: false; message: string }

export function useMyLeaveActions(
  snapshot: LeaveSnapshot | null,
  viewer: LeaveViewer,
  employee: LeaveEmployee | undefined,
  reload: () => Promise<void>,
  apiEmployeeId: string | null,
) {
  const canApplyLive = useShouldApplyLeave()
  const shouldApplyLive = Boolean(canApplyLive && apiEmployeeId)
  const [applyLeave] = useApplyLeaveMutation()
  const { data: leaveTypesData } = useGetLeaveTypesQuery(undefined, {
    skip: !shouldApplyLive,
  })

  async function handleCancel(row: LeaveRequest) {
    cancelRequest(row.id, viewer.employeeId, viewer.displayName, 'Cancelled by employee')
    await reload()
  }

  async function handleApply(input: ApplyLeaveFormInput): Promise<ApplyLeaveResult> {
    if (shouldApplyLive && apiEmployeeId) {
      if (!leaveTypesData) {
        return {
          ok: false,
          message: 'Leave types are still loading. Wait a moment and try again.',
        }
      }
      const leaveTypeId = resolveLeaveTypeIdForCode(input.leaveTypeCode, leaveTypesData)
      if (!leaveTypeId) {
        return {
          ok: false,
          message: `Leave type "${input.leaveTypeCode}" is not available on the server.`,
        }
      }
      try {
        await applyLeave({
          employeeId: apiEmployeeId,
          leaveTypeId,
          startDate: input.fromDate,
          endDate: input.toDate,
          dayPortion: input.dayPortion ?? 'FULL_DAY',
          reason: input.reason,
        }).unwrap()
        await reload()
        return { ok: true }
      } catch (error) {
        return {
          ok: false,
          message: getApiErrorMessage(error, 'Unable to submit leave request. Please try again.'),
        }
      }
    }

    if (snapshot?.requestsSource === 'api') {
      return {
        ok: false,
        message: liveApplyBlockedMessage(canApplyLive, apiEmployeeId),
      }
    }

    if (!snapshot || !employee) {
      return { ok: false, message: 'Leave data is not ready.' }
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
          actorId: viewer.employeeId,
          actorName: viewer.displayName,
        },
      ],
    })
    await reload()
    return { ok: true }
  }

  return { handleCancel, handleApply, useLiveApply: shouldApplyLive }
}