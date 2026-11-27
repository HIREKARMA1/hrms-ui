import { useCallback, useMemo } from 'react'

import { useAppSelector } from '@/app/store/hooks'
import { selectCurrentUser } from '@/features/auth/store/authSlice'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetPendingApprovalsQuery } from '../api/leaveApprovalApi'
import { useGetEmployeeLeavePolicyHrOverviewQuery } from '../api/employeeLeavePoliciesApi'
import {
  buildAttentionSummary,
  type AttentionLiveOptions,
  type AttentionSummary,
} from '../utils/buildAttentionSummary'
import { countLowBalanceEmployeesFromHrOverview } from '../utils/countLowBalanceFromHrOverview'
import { mapApiEmployeeLeavePolicyHrOverviewToTableRows } from '../utils/mapApiEmployeeLeavePolicyHrOverview'
import type { LeaveSnapshot } from '../services/leaveService'
import { leaveTodayIso } from '../utils/leaveToday'
import { useLeavePermissions } from './useLeavePermissions'
import { useShouldFetchLeaveList } from './useShouldFetchLeaveList'

const HR_OVERVIEW_ATTENTION_LIMIT = 100

export function useLeaveOverviewAttention(options: {
  enabled: boolean
  snapshot: LeaveSnapshot | null
}) {
  const { enabled, snapshot } = options
  const { canAccess } = useOptionalFeatureAccess()
  const { canApprove } = useLeavePermissions()
  const mayUseLeaveApi = useShouldFetchLeaveList()
  const user = useAppSelector(selectCurrentUser)
  const linkedEmployeeId = user?.employeeId?.trim() ?? ''
  const canFetchWorkflow = enabled && mayUseLeaveApi && canApprove && Boolean(linkedEmployeeId)

  const workflow = useGetPendingApprovalsQuery(undefined, { skip: !canFetchWorkflow })

  const canBalances = canAccess('leave.balances')
  const year = Number(leaveTodayIso().slice(0, 4))
  const hrOverview = useGetEmployeeLeavePolicyHrOverviewQuery(
    { page: 1, limit: HR_OVERVIEW_ATTENTION_LIMIT, year },
    { skip: !enabled || !canBalances },
  )

  const workflowPending = useMemo(() => {
    if (!enabled || !snapshot?.api) return undefined
    if (!canFetchWorkflow) return null
    if (workflow.isLoading || workflow.isError || !workflow.data) return undefined
    return workflow.data
  }, [canFetchWorkflow, enabled, snapshot?.api, workflow.data, workflow.isError, workflow.isLoading])

  const lowBalanceEmployeeCount = useMemo(() => {
    if (!enabled || !snapshot?.api) return undefined
    if (!canBalances) return null
    if (hrOverview.isLoading || hrOverview.isError || !hrOverview.data) return undefined
    const rows = mapApiEmployeeLeavePolicyHrOverviewToTableRows(hrOverview.data)
    return countLowBalanceEmployeesFromHrOverview(rows)
  }, [
    canBalances,
    enabled,
    hrOverview.data,
    hrOverview.isError,
    hrOverview.isLoading,
    snapshot?.api,
  ])

  const liveOptions: AttentionLiveOptions | undefined = useMemo(() => {
    if (!enabled || !snapshot?.api) return undefined
    if (canFetchWorkflow && workflowPending === undefined) return undefined
    if (canBalances && lowBalanceEmployeeCount === undefined) return undefined
    return {
      workflowPending: canFetchWorkflow ? workflowPending ?? null : null,
      lowBalanceEmployeeCount: canBalances ? lowBalanceEmployeeCount ?? null : null,
      serverOtherItems: true,
    }
  }, [
    canBalances,
    canFetchWorkflow,
    enabled,
    lowBalanceEmployeeCount,
    snapshot?.api,
    workflowPending,
  ])

  const summary: AttentionSummary | null = useMemo(() => {
    if (!snapshot) return null
    return buildAttentionSummary(snapshot, liveOptions)
  }, [liveOptions, snapshot])

  const loading =
    enabled &&
    Boolean(snapshot?.api) &&
    ((canFetchWorkflow && workflowPending === undefined) ||
      (canBalances && lowBalanceEmployeeCount === undefined))

  const error = (() => {
    if (!enabled || !snapshot?.api) return null
    if (canFetchWorkflow && workflow.isError) {
      return getApiErrorMessage(workflow.error, 'Could not load pending approvals.')
    }
    if (canBalances && hrOverview.isError) {
      return getApiErrorMessage(hrOverview.error, 'Could not load balance overview.')
    }
    return null
  })()

  const refetch = useCallback(async () => {
    await Promise.allSettled([
      canFetchWorkflow ? workflow.refetch() : Promise.resolve(),
      canBalances ? hrOverview.refetch() : Promise.resolve(),
    ])
  }, [canBalances, canFetchWorkflow, hrOverview, workflow])

  return {
    summary,
    loading,
    error,
    refetch,
    useLiveAttention: Boolean(liveOptions),
  }
}