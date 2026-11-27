/**
 * Server leave mutations for signed-in users. Every action resolves to a
 * result instead of throwing so callers can show the backend's message.
 * Successful mutations invalidate the leave cache, which refetches the
 * snapshot; no manual reload is needed.
 */

import { useMemo } from 'react'

import {
  getLeaveErrorMessage,
  useAdjustLeaveBalanceMutation,
  useApplyLeaveMutation,
  useApproveEncashmentMutation,
  useApproveLeaveMutation,
  useCancelEncashmentMutation,
  useCancelLeaveMutation,
  useCreateEncashmentMutation,
  useExpireCarryForwardMutation,
  useRejectEncashmentMutation,
  useRejectLeaveMutation,
  useRunAccrualMutation,
  useRunCarryForwardMutation,
} from '../api/leaveApi'
import {
  useApproveWorkflowLeaveMutation,
  useRejectWorkflowLeaveMutation,
} from '../api/leaveApprovalApi'
import type {
  AdjustLeaveBalanceBody,
  CreateEncashmentBody,
  ExpireCarryForwardBody,
  RunAccrualBody,
  RunCarryForwardBody,
} from '../api/leaveApi.types'
import {
  buildApplyLeaveBody,
  describeAccrualRun,
  describeCarryForwardExpiry,
  describeCarryForwardRun,
  type ApplyLeaveInput,
  type LeaveTypeOption,
} from '../api/leaveMappers'
import type { LeaveRequest } from '../types/leaveRequest'

export type LeaveActionResult = { ok: true } | { ok: false; message: string }

/** Policy runs resolve with a human-readable summary of the server counters. */
export type LeaveRunResult = { ok: true; summary: string } | { ok: false; message: string }

async function toRunResult<T>(pending: Promise<T>, describe: (data: T) => string, fallback: string): Promise<LeaveRunResult> {
  try {
    return { ok: true, summary: describe(await pending) }
  } catch (error) {
    return { ok: false, message: getLeaveErrorMessage(error, fallback) }
  }
}

/** Awaits an RTK mutation `.unwrap()` and turns a rejection into a message. */
export async function toLeaveActionResult(pending: Promise<unknown>, fallback: string): Promise<LeaveActionResult> {
  try {
    await pending
    return { ok: true }
  } catch (error) {
    return { ok: false, message: getLeaveErrorMessage(error, fallback) }
  }
}

export function useLeaveApiActions() {
  const [applyLeave] = useApplyLeaveMutation()
  const [approveLeave] = useApproveLeaveMutation()
  const [rejectLeave] = useRejectLeaveMutation()
  const [cancelLeave] = useCancelLeaveMutation()
  const [createEncashment] = useCreateEncashmentMutation()
  const [approveEncashment] = useApproveEncashmentMutation()
  const [rejectEncashment] = useRejectEncashmentMutation()
  const [cancelEncashment] = useCancelEncashmentMutation()
  const [adjustLeaveBalance] = useAdjustLeaveBalanceMutation()
  const [runAccrual] = useRunAccrualMutation()
  const [runCarryForward] = useRunCarryForwardMutation()
  const [expireCarryForward] = useExpireCarryForwardMutation()
  const [approveWorkflowLeave] = useApproveWorkflowLeaveMutation()
  const [rejectWorkflowLeave] = useRejectWorkflowLeaveMutation()

  return useMemo(
    () => ({
      async apply(input: ApplyLeaveInput, types: LeaveTypeOption[]): Promise<LeaveActionResult> {
        const built = buildApplyLeaveBody(input, types)
        if (!built.ok) return { ok: false, message: built.error }
        return toLeaveActionResult(applyLeave(built.body).unwrap(), 'Could not submit the leave request.')
      },
      async approve(request: LeaveRequest, note?: string): Promise<LeaveActionResult> {
        if (request.multiLevelWorkflow) {
          return toLeaveActionResult(
            approveWorkflowLeave({ leaveRequestId: request.id, note }).unwrap(),
            'Could not approve the request.',
          )
        }
        return toLeaveActionResult(approveLeave({ id: request.id, note }).unwrap(), 'Could not approve the request.')
      },
      async reject(request: LeaveRequest, note?: string): Promise<LeaveActionResult> {
        if (request.multiLevelWorkflow) {
          return toLeaveActionResult(
            rejectWorkflowLeave({ leaveRequestId: request.id, note }).unwrap(),
            'Could not reject the request.',
          )
        }
        return toLeaveActionResult(rejectLeave({ id: request.id, note }).unwrap(), 'Could not reject the request.')
      },
      async cancel(requestId: string, reason?: string): Promise<LeaveActionResult> {
        return toLeaveActionResult(cancelLeave({ id: requestId, reason }).unwrap(), 'Could not cancel the request.')
      },
      async approveEncashment(encashmentId: string): Promise<LeaveActionResult> {
        return toLeaveActionResult(approveEncashment({ id: encashmentId }).unwrap(), 'Could not approve the encashment.')
      },
      async rejectEncashment(encashmentId: string): Promise<LeaveActionResult> {
        return toLeaveActionResult(rejectEncashment({ id: encashmentId }).unwrap(), 'Could not reject the encashment.')
      },
      async createEncashment(body: CreateEncashmentBody): Promise<LeaveActionResult> {
        return toLeaveActionResult(createEncashment(body).unwrap(), 'Could not submit the encashment request.')
      },
      async cancelEncashment(encashmentId: string, reason?: string): Promise<LeaveActionResult> {
        return toLeaveActionResult(
          cancelEncashment({ id: encashmentId, reason }).unwrap(),
          'Could not cancel the encashment request.',
        )
      },
      /** Resolves with the employee's entitled days for the year after the adjustment. */
      async adjustBalance(body: AdjustLeaveBalanceBody): Promise<LeaveActionResult & { entitledDays?: number }> {
        try {
          const saved = await adjustLeaveBalance(body).unwrap()
          return { ok: true, entitledDays: saved.entitledDays }
        } catch (error) {
          return { ok: false, message: getLeaveErrorMessage(error, 'Could not save the adjustment.') }
        }
      },
      runAccrual(body: RunAccrualBody): Promise<LeaveRunResult> {
        return toRunResult(runAccrual(body).unwrap(), describeAccrualRun, 'Could not run accrual.')
      },
      runCarryForward(body: RunCarryForwardBody): Promise<LeaveRunResult> {
        return toRunResult(runCarryForward(body).unwrap(), describeCarryForwardRun, 'Could not run carry-forward.')
      },
      expireCarryForward(body: ExpireCarryForwardBody): Promise<LeaveRunResult> {
        return toRunResult(
          expireCarryForward(body).unwrap(),
          (result) => describeCarryForwardExpiry(body.year, result),
          'Could not expire carried-forward leave.',
        )
      },
    }),
    [
      adjustLeaveBalance,
      applyLeave,
      approveEncashment,
      approveLeave,
      approveWorkflowLeave,
      cancelEncashment,
      cancelLeave,
      createEncashment,
      expireCarryForward,
      rejectEncashment,
      rejectLeave,
      rejectWorkflowLeave,
      runAccrual,
      runCarryForward,
    ],
  )
}
