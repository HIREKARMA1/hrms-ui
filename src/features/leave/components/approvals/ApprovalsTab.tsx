/**
 * Manager Approvals: leave, encashment, and comp-off queues for direct reports.
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useLeave } from '../../hooks/useLeave'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { useManagerApprovalsTab } from '../../hooks/useManagerApprovalsTab'
import type { LeaveViewer } from '../../types/viewer'
import type { LeaveRequest } from '../../types/leaveRequest'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveEmployeeLinkNotice } from '../shared/LeaveEmployeeLinkNotice'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { LeaveSegmentedControl } from '../shared/LeaveSegmentedControl'
import { ApprovalsCompOffTable } from './ApprovalsCompOffTable'
import { ApprovalsEncashmentTable } from './ApprovalsEncashmentTable'
import { ApprovalsLeaveTable } from './ApprovalsLeaveTable'
import { ApprovalsManagerOverview } from './ApprovalsManagerOverview'
import { ApprovalsTabDialogs } from './ApprovalsTabDialogs'

type ApprovalsTabProps = { viewer: LeaveViewer }
type Segment = 'leave' | 'encashment' | 'comp-off'

const SEGMENTS = [
  { value: 'leave' as const, label: 'Leave requests' },
  { value: 'encashment' as const, label: 'Encashment' },
  { value: 'comp-off' as const, label: 'Comp-off earn' },
]

export function ApprovalsTab({ viewer }: ApprovalsTabProps) {
  const { snapshot, reload } = useLeave()
  const { showToast } = useLeaveToast()
  const queues = useManagerApprovalsTab(snapshot, viewer, reload, showToast)
  const permissions = useLeavePermissions()
  // The encashment queue needs leave_encashments:read; leaves:approve alone
  // does not reveal it.
  const segments = SEGMENTS.filter(
    (item) => item.value !== 'encashment' || permissions.canViewEncashments,
  )
  const [segment, setSegment] = useState<Segment>('leave')
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  const [delegateOpen, setDelegateOpen] = useState(false)
  const [action, setAction] = useState<{ mode: 'approve' | 'reject'; request: LeaveRequest } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  if (!snapshot) return null
  const nameFor = (id: string) => snapshot.employees.find((item) => item.id === id)?.name ?? id

  async function confirmLeave(comment: string) {
    if (!action) return
    setBusyId(action.request.id)
    await queues.runLeaveAction(action.request.id, action.mode, comment)
    setBusyId(null)
    setAction(null)
    setDetail(null)
  }

  async function resolveSimple(id: string, mode: 'approve' | 'reject', kind: 'encashment' | 'comp-off') {
    setBusyId(id)
    if (kind === 'encashment') await queues.runEncashmentAction(id, mode)
    else await queues.runCompOffAction(id, mode)
    setBusyId(null)
  }

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="Approvals"
        subtitle="Review leave, encashment, and comp-off requests from your direct reports."
        actions={
          <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setDelegateOpen(true)}>
            Set delegate
          </Button>
        }
      />
      {viewer.employeeId ? (
        <ApprovalsManagerOverview snapshot={snapshot} managerId={viewer.employeeId} />
      ) : (
        <LeaveEmployeeLinkNotice />
      )}
      <LeaveSegmentedControl options={segments} value={segment} onChange={setSegment} ariaLabel="Approval queues" />
      {segment === 'leave' ? (
        <ApprovalsLeaveTable
          rows={queues.pendingLeave}
          employeeName={nameFor}
          onView={setDetail}
          onApprove={(id) => {
            const row = queues.pendingLeave.find((item) => item.id === id)
            if (row) setAction({ mode: 'approve', request: row })
          }}
          onReject={(id) => {
            const row = queues.pendingLeave.find((item) => item.id === id)
            if (row) setAction({ mode: 'reject', request: row })
          }}
          busyId={busyId}
        />
      ) : null}
      {segment === 'encashment' && permissions.canViewEncashments ? (
        <ApprovalsEncashmentTable
          rows={queues.pendingEncashment}
          employeeName={nameFor}
          onApprove={(id) => void resolveSimple(id, 'approve', 'encashment')}
          onReject={(id) => void resolveSimple(id, 'reject', 'encashment')}
          busyId={busyId}
        />
      ) : null}
      {segment === 'comp-off' ? (
        <ApprovalsCompOffTable
          rows={queues.pendingCompOff}
          employeeName={nameFor}
          onApprove={(id) => void resolveSimple(id, 'approve', 'comp-off')}
          onReject={(id) => void resolveSimple(id, 'reject', 'comp-off')}
          busyId={busyId}
        />
      ) : null}
      <ApprovalsTabDialogs
        snapshot={snapshot}
        detail={detail}
        setDetail={setDetail}
        delegateOpen={delegateOpen}
        setDelegateOpen={setDelegateOpen}
        onDelegateSaved={() => showToast('Delegate saved.')}
        action={action}
        setAction={setAction}
        busy={Boolean(busyId)}
        viewerCanAct={permissions.canApprove}
        onConfirmAction={(comment) => void confirmLeave(comment)}
        onApproveFromDetail={() => detail && setAction({ mode: 'approve', request: detail })}
        onRejectFromDetail={() => detail && setAction({ mode: 'reject', request: detail })}
      />
    </div>
  )
}
