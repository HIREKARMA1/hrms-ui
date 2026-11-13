/**
 * Stat cards for the manager Approvals tab (team-scoped queues).
 */

import { AlertTriangle, Clock, Coins, ListChecks } from 'lucide-react'

import type { LeaveSnapshot } from '../../services/leaveService'
import {
  pendingManagerCompOffRequests,
  pendingManagerEncashments,
  pendingManagerLeaveRequests,
  teamEscalatedLeaveCount,
} from '../../utils/managerApprovalsQueue'
import { LeaveStatGrid } from '../LeaveStatGrid'

type ApprovalsManagerOverviewProps = {
  snapshot: LeaveSnapshot
  managerId: string
}

export function ApprovalsManagerOverview({ snapshot, managerId }: ApprovalsManagerOverviewProps) {
  const pendingLeave = pendingManagerLeaveRequests(snapshot, managerId)
  const encashment = pendingManagerEncashments(snapshot, managerId)
  const compOff = pendingManagerCompOffRequests(snapshot, managerId)

  return (
    <LeaveStatGrid
      items={[
        {
          label: 'Leave awaiting you',
          value: String(pendingLeave.length),
          icon: ListChecks,
          tone: 'warning',
        },
        {
          label: 'Encashment',
          value: String(encashment.length),
          icon: Clock,
          tone: 'primary',
        },
        {
          label: 'Comp-off earn',
          value: String(compOff.length),
          icon: Coins,
          tone: 'neutral',
        },
        {
          label: 'Escalated (team)',
          value: String(teamEscalatedLeaveCount(snapshot, managerId)),
          icon: AlertTriangle,
          tone: 'danger',
        },
      ]}
    />
  )
}
