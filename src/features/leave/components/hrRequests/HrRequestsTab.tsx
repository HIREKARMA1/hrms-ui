/**
 * HR Admin Requests tab: queues, filters, apply on behalf, cancel any request.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import { useLeave } from '../../hooks/useLeave'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import type { HrRequestsSegment } from '../../context/leavePageNavTypes'
import { useHrRequestActions } from '../../hooks/useHrRequestActions'
import type { LeaveViewer } from '../../types/viewer'
import type { LeaveRequest } from '../../types/leaveRequest'
import { activeEmployees } from '../../utils/employmentStatus'
import { filterHrRequests } from '../../utils/hrRequestsFilters'
import { isHrActionRequest } from '../../utils/attentionHrQueue'
import { approveRequest, rejectRequest } from '../../services/leaveService'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveSegmentedControl } from '../shared/LeaveSegmentedControl'
import { LeaveTableFilters } from '../shared/LeaveTableFilters'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { ApproveRejectDialog } from '../dialogs/ApproveRejectDialog'
import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { HrRequestsTable } from './HrRequestsTable'
import { HrApplyOnBehalfDialog } from './HrApplyOnBehalfDialog'
import { HrCancelRequestDialog } from './HrCancelRequestDialog'
import { HrEncashmentRequestsLiveSection } from './HrEncashmentRequestsLiveSection'

const SEGMENTS = [
  { value: 'action' as const, label: 'Needs my action' },
  { value: 'all' as const, label: 'All requests' },
  { value: 'encashment' as const, label: 'Encashment' },
  { value: 'compoff' as const, label: 'Comp-off' },
]

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
  const [segment, setSegment] = useState<HrRequestsSegment>(initialSegment)
  const [search, setSearch] = useState(initialSearch)
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [action, setAction] = useState<{ mode: 'approve' | 'reject'; request: LeaveRequest } | null>(null)
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const employees = useMemo(() => activeEmployees(snapshot?.employees ?? []), [snapshot?.employees])
  const leaveRows = useMemo(() => (snapshot ? filterHrRequests(snapshot, employees, segment, search) : []), [employees, search, segment, snapshot])

  if (!snapshot) return null
  const nameFor = (id: string) => snapshot.employees.find((item) => item.id === id)?.name ?? id

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Requests" subtitle="All leave, encashment and comp-off requests." actions={<Button type="button" onClick={() => setApplyOpen(true)}>Apply on behalf</Button>} />
      <LeaveSegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} ariaLabel="Request queues" />
      {segment === 'encashment' ? (
        <HrEncashmentRequestsLiveSection
          search={search}
          onSearchChange={setSearch}
          employeeName={nameFor}
        />
      ) : null}
      {segment === 'compoff' ? (
        <LeaveEmptyState message="Comp-off requests are still demo-only until the comp-off list API is wired." />
      ) : null}
      {segment === 'action' || segment === 'all' ? (
        <>
          <LeaveTableFilters searchId="hr-req-search" searchPlaceholder="Search employee or type" searchValue={search} onSearchChange={setSearch} showing={leaveRows.length} total={snapshot.requests.length} />
          {leaveRows.length === 0 ? <LeaveEmptyState message="No requests match this filter." /> : <HrRequestsTable rows={leaveRows} employees={snapshot.employees} requests={snapshot.requests} onView={setDetail} onApprove={(id) => pickAction(snapshot, id, 'approve', setAction)} onReject={(id) => pickAction(snapshot, id, 'reject', setAction)} onCancel={setCancelTarget} busyId={busyId} />}
        </>
      ) : null}
      <HrApplyOnBehalfDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        snapshot={snapshot}
        submitterName={viewer.displayName}
        onSubmit={async (employeeId, input) => {
          const employee = employees.find((item) => item.id === employeeId)
          if (!employee) return
          await applyOnBehalf(employee, input)
          showToast('Request submitted on behalf.')
          setApplyOpen(false)
        }}
      />
      <RequestDetailDialog
        open={Boolean(detail)}
        request={detail}
        employeeName={detail ? nameFor(detail.employeeId) : undefined}
        balanceBefore={detail ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) : 0}
        balanceAfter={detail ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) - detail.days : 0}
        onOpenChange={(open) => !open && setDetail(null)}
        canApprove={detail ? isHrActionRequest(snapshot, detail) : false}
        canReject={detail ? isHrActionRequest(snapshot, detail) : false}
        onApprove={() => detail && pickAction(snapshot, detail.id, 'approve', setAction)}
        onReject={() => detail && pickAction(snapshot, detail.id, 'reject', setAction)}
      />
      <ApproveRejectDialog open={Boolean(action)} mode={action?.mode ?? 'approve'} request={action?.request ?? null} employeeName={action ? nameFor(action.request.employeeId) : ''} onOpenChange={(open) => !open && setAction(null)} onConfirm={(comment) => action && void confirmAction(action, comment, viewer, reload, setBusyId, setAction, showToast)} />
      <HrCancelRequestDialog request={cancelTarget} employeeName={cancelTarget ? nameFor(cancelTarget.employeeId) : ''} onOpenChange={(open) => !open && setCancelTarget(null)} onConfirm={async (reason) => { if (!cancelTarget) return; await hrCancel(cancelTarget.id, reason); showToast('Request cancelled.'); setCancelTarget(null) }} />
    </div>
  )
}

function pickAction(snapshot: NonNullable<ReturnType<typeof useLeave>['snapshot']>, id: string, mode: 'approve' | 'reject', setAction: (value: { mode: 'approve' | 'reject'; request: LeaveRequest }) => void) {
  const row = snapshot.requests.find((item) => item.id === id)
  if (row) setAction({ mode, request: row })
}

async function confirmAction(
  action: { mode: 'approve' | 'reject'; request: LeaveRequest },
  comment: string,
  viewer: LeaveViewer,
  reload: () => Promise<void>,
  setBusyId: (id: string | null) => void,
  setAction: (value: null) => void,
  showToast: (message: string) => void,
) {
  setBusyId(action.request.id)
  if (action.mode === 'approve') {
    approveRequest(action.request.id, viewer.employeeId, viewer.displayName, 'HR')
    showToast('Request approved.')
  } else {
    rejectRequest(action.request.id, viewer.employeeId, viewer.displayName, comment.trim() || 'Not approved')
    showToast('Request rejected.')
  }
  await reload()
  setBusyId(null)
  setAction(null)
}
