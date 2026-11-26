/**
 * HR Admin Requests tab: queues, filters, apply on behalf, cancel any request.
 * Server snapshots act through the leave API; demo snapshots use the mock store.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import { useLeave } from '../../hooks/useLeave'
import { useLeaveApiActions, type LeaveActionResult } from '../../hooks/useLeaveApiActions'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import type { HrRequestsSegment } from '../../context/leavePageNavTypes'
import { useHrRequestActions } from '../../hooks/useHrRequestActions'
import type { LeaveSnapshot } from '../../services/leaveService'
import type { LeaveViewer } from '../../types/viewer'
import type { LeaveRequest } from '../../types/leaveRequest'
import { activeEmployees } from '../../utils/employmentStatus'
import { filterHrRequests, mergeHrActionLeaveQueue } from '../../utils/hrRequestsFilters'
import { useApprovalsPendingLeave } from '../../hooks/useApprovalsPendingLeave'
import {
  canUserActOnLeaveRequest,
  hrActionableLeaveRequestIds,
  mergeLeaveRequestForWorkflowAction,
} from '../../utils/leaveWorkflowApproval'
import { approveRequest, rejectRequest } from '../../services/leaveService'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveSegmentedControl } from '../shared/LeaveSegmentedControl'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { ApproveRejectDialog } from '../dialogs/ApproveRejectDialog'
import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'
import { HrEncashmentRequestsLiveSection } from './HrEncashmentRequestsLiveSection'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { HrRequestsTable } from './HrRequestsTable'
import { HrApplyOnBehalfDialog } from './HrApplyOnBehalfDialog'
import { HrCancelRequestDialog } from './HrCancelRequestDialog'
import { LeaveErrorState } from '../LeaveErrorState'
import { WorkflowApproverQueueNotice } from '../shared/WorkflowApproverQueueNotice'

const SEGMENTS = [
  { value: 'action' as const, label: 'Needs my action' },
  { value: 'all' as const, label: 'All requests' },
  { value: 'encashment' as const, label: 'Encashment' },
  { value: 'compoff' as const, label: 'Comp-off' },
]

type ReviewAction = { mode: 'approve' | 'reject'; request: LeaveRequest }

export function HrRequestsTab({
  viewer,
  initialSegment = 'action',
  initialSearch = '',
}: {
  viewer: LeaveViewer
  initialSegment?: HrRequestsSegment
  initialSearch?: string
}) {
  const { snapshot, reload } = useLeave()
  const { showToast } = useLeaveToast()
  const { applyOnBehalf, hrCancel } = useHrRequestActions(snapshot, viewer, reload)
  const server = useLeaveApiActions()
  const permissions = useLeavePermissions()
  const [segment, setSegment] = useState<HrRequestsSegment>(initialSegment)
  const [search, setSearch] = useState(initialSearch)
  const [encashmentSearch, setEncashmentSearch] = useState('')
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [action, setAction] = useState<ReviewAction | null>(null)
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  const employees = useMemo(() => activeEmployees(snapshot?.employees ?? []), [snapshot?.employees])
  const actionQueueMock = useMemo(
    () => (snapshot ? filterHrRequests(snapshot, employees, 'action', '') : []),
    [employees, snapshot],
  )
  const pendingLeaveApi = useApprovalsPendingLeave(actionQueueMock)
  const leaveRows = useMemo(() => {
    if (!snapshot) return []
    if (segment === 'action' && snapshot.api?.access.requests) {
      if (pendingLeaveApi.blockingError || pendingLeaveApi.skippedNoEmployeeLink) {
        const hrSingle = filterHrRequests(snapshot, employees, 'action', search).filter((row) => !row.multiLevelWorkflow)
        return hrSingle
      }
      if (pendingLeaveApi.useLiveApi) {
        return mergeHrActionLeaveQueue(snapshot, employees, pendingLeaveApi.rows, search)
      }
    }
    return filterHrRequests(snapshot, employees, segment, search)
  }, [
    employees,
    pendingLeaveApi.blockingError,
    pendingLeaveApi.skippedNoEmployeeLink,
    pendingLeaveApi.rows,
    pendingLeaveApi.useLiveApi,
    search,
    segment,
    snapshot,
  ])

  const actionableLeaveIds = useMemo(() => {
    if (!snapshot || segment !== 'action') return new Set<string>()
    const useLive = Boolean(snapshot.api?.access.requests && pendingLeaveApi.useLiveApi)
    return hrActionableLeaveRequestIds(snapshot, employees, pendingLeaveApi.rows, useLive)
  }, [employees, pendingLeaveApi.rows, pendingLeaveApi.useLiveApi, segment, snapshot])

  if (!snapshot) return null
  const api = snapshot.api
  const nameFor = (id: string) => snapshot.employees.find((item) => item.id === id)?.name ?? id
  const report = (result: LeaveActionResult, success: string) => showToast(result.ok ? success : result.message)

  async function confirmAction(current: ReviewAction, comment: string) {
    setBusyId(current.request.id)
    if (api) {
      const result =
        current.mode === 'approve'
          ? await server.approve(current.request, comment)
          : await server.reject(current.request, comment)
      report(result, current.mode === 'approve' ? 'Request approved.' : 'Request rejected.')
      if (result.ok) await reload()
    } else {
      if (current.mode === 'approve') {
        approveRequest(current.request.id, viewer.actorId, viewer.displayName, 'HR')
        showToast('Request approved.')
      } else {
        rejectRequest(current.request.id, viewer.actorId, viewer.displayName, comment.trim() || 'Not approved')
        showToast('Request rejected.')
      }
      await reload()
    }
    setBusyId(null)
    setAction(null)
  }

  async function decideEncashment(encashmentId: string, mode: 'approve' | 'reject') {
    setBusyId(encashmentId)
    const result = mode === 'approve' ? await server.approveEncashment(encashmentId) : await server.rejectEncashment(encashmentId)
    report(result, mode === 'approve' ? 'Encashment approved.' : 'Encashment rejected.')
    setBusyId(null)
  }

  const truncated = api && api.requestTotal > snapshot.requests.length
  // Server balances are per employee and are not part of the snapshot.
  const detailBalance = detail && !api ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) : null

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Requests" subtitle="All leave, encashment and comp-off requests." actions={permissions.canCreateOnBehalf ? <Button type="button" onClick={() => setApplyOpen(true)}>Apply on behalf</Button> : null} />
      <LeaveSegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} ariaLabel="Request queues" />
      {segment === 'encashment' ? (
        api?.access.encashments ? (
          <HrEncashmentRequestsLiveSection
            search={encashmentSearch}
            onSearchChange={setEncashmentSearch}
            employeeName={nameFor}
            onApprove={(id) => void decideEncashment(id, 'approve')}
            onReject={(id) => void decideEncashment(id, 'reject')}
            busyId={busyId}
          />
        ) : (
          <LeaveEmptyState message={api ? 'You do not have permission to review encashment requests across the organisation.' : 'Switch to Needs my action or All requests for leave queues.'} />
        )
      ) : segment === 'compoff' ? (
        <LeaveEmptyState message={api ? 'Comp-off requests are not available from the server yet.' : 'Switch to Needs my action or All requests for leave queues.'} />
      ) : api && !api.access.requests ? (
        <LeaveEmptyState message="You do not have permission to view leave requests across the organisation." />
      ) : (
        <>
          <LeaveTableFilters
            searchId="hr-req-search"
            searchPlaceholder="Search employee or type"
            searchValue={search}
            onSearchChange={setSearch}
            showing={leaveRows.length}
            total={
              segment === 'action' && pendingLeaveApi.useLiveApi
                ? pendingLeaveApi.rows.length + actionQueueMock.filter((row) => !row.multiLevelWorkflow).length
                : api
                  ? api.requestTotal
                  : snapshot.requests.length
            }
          />
          {segment === 'action' && pendingLeaveApi.skippedNoEmployeeLink ? <WorkflowApproverQueueNotice /> : null}
          {segment === 'action' && pendingLeaveApi.isFetching ? (
            <p className="text-xs text-hrms-text-muted">Loading workflow approvals…</p>
          ) : null}
          {segment === 'action' && pendingLeaveApi.errorMessage ? (
            <LeaveErrorState
              message={pendingLeaveApi.errorMessage}
              onRetry={pendingLeaveApi.refetch}
            />
          ) : null}
          {truncated ? (
            <p className="text-xs text-hrms-text-secondary">Showing the {snapshot.requests.length} most recent of {api.requestTotal} requests.</p>
          ) : null}
          {leaveRows.length === 0 ? (
            <LeaveEmptyState
              message={
                segment === 'action' && pendingLeaveApi.skippedNoEmployeeLink
                  ? 'No single-level requests need your action. Switch to All requests for the full organisation queue.'
                  : 'No requests match this filter.'
              }
            />
          ) : (
            <HrRequestsTable
              rows={leaveRows}
              employees={snapshot.employees}
              requests={snapshot.requests}
              actionableRequestIds={actionableLeaveIds}
              onView={setDetail}
              onApprove={(id) => pickAction(leaveRows, snapshot, id, 'approve', setAction)}
              onReject={(id) => pickAction(leaveRows, snapshot, id, 'reject', setAction)}
              onCancel={setCancelTarget}
              busyId={busyId}
            />
          )}
        </>
      )}
      <HrApplyOnBehalfDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        snapshot={snapshot}
        submitterName={viewer.displayName}
        saving={applying}
        onSubmit={async (employeeId, input) => {
          const employee = employees.find((item) => item.id === employeeId)
          if (!employee) return false
          setApplying(true)
          const result = await applyOnBehalf(employee, input)
          setApplying(false)
          report(result, 'Request submitted on behalf.')
          return result.ok
        }}
      />
      <RequestDetailDialog
        open={Boolean(detail)}
        request={detail}
        employeeName={detail ? nameFor(detail.employeeId) : undefined}
        balanceBefore={detailBalance}
        balanceAfter={detail && detailBalance !== null ? detailBalance - detail.days : null}
        onOpenChange={(open) => !open && setDetail(null)}
        canApprove={
          permissions.canApprove && detail ? canUserActOnLeaveRequest(detail, actionableLeaveIds) : false
        }
        canReject={
          permissions.canApprove && detail ? canUserActOnLeaveRequest(detail, actionableLeaveIds) : false
        }
        onApprove={() => detail && pickAction(leaveRows, snapshot, detail.id, 'approve', setAction)}
        onReject={() => detail && pickAction(leaveRows, snapshot, detail.id, 'reject', setAction)}
        useLiveApi={Boolean(api)}
        useLiveApprovalHistory={Boolean(api)}
      />
      <ApproveRejectDialog open={Boolean(action)} mode={action?.mode ?? 'approve'} request={action?.request ?? null} employeeName={action ? nameFor(action.request.employeeId) : ''} onOpenChange={(open) => !open && setAction(null)} onConfirm={(comment) => action && void confirmAction(action, comment)} />
      <HrCancelRequestDialog request={cancelTarget} employeeName={cancelTarget ? nameFor(cancelTarget.employeeId) : ''} onOpenChange={(open) => !open && setCancelTarget(null)} onConfirm={async (reason) => { if (!cancelTarget) return; const result = await hrCancel(cancelTarget.id, reason); report(result, 'Request cancelled.'); setCancelTarget(null) }} />
    </div>
  )
}

function pickAction(
  rows: LeaveRequest[],
  snapshot: LeaveSnapshot,
  id: string,
  mode: 'approve' | 'reject',
  setAction: (value: ReviewAction) => void,
) {
  const row = rows.find((item) => item.id === id) ?? snapshot.requests.find((item) => item.id === id)
  if (row) setAction({ mode, request: mergeLeaveRequestForWorkflowAction(row, snapshot.requests) })
}
