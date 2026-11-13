/**
 * Manager stat row: team queue snapshot above personal My Leave filters.
 */

import { CalendarDays, ListChecks, Sun, Users } from 'lucide-react'

import type { LeaveSnapshot } from '../../services/leaveService'
import type { LeaveViewer } from '../../types/viewer'
import { managerOverviewStats } from '../../utils/myLeaveManagerInsights'
import { managerDepartmentLabel } from '../../utils/managerTeam'
import { LeaveStatGrid } from '../LeaveStatGrid'
import type { BalanceCardModel } from './MyLeaveBalanceCards'
import { totalAvailableDays } from '../../utils/myLeaveEmployeeInsights'

type MyLeaveManagerOverviewProps = {
  snapshot: LeaveSnapshot
  viewer: LeaveViewer
  cards: BalanceCardModel[]
}

export function MyLeaveManagerOverview({ snapshot, viewer, cards }: MyLeaveManagerOverviewProps) {
  const stats = managerOverviewStats(snapshot, viewer.employeeId)
  const department = managerDepartmentLabel(snapshot, viewer.employeeId)

  return (
    <LeaveStatGrid
      items={[
        {
          label: 'Your available days',
          value: String(totalAvailableDays(cards)),
          detail: department ? `${department} manager` : undefined,
          icon: CalendarDays,
          tone: 'primary',
        },
        {
          label: 'Direct reports',
          value: String(stats.directReports),
          icon: Users,
          tone: 'neutral',
        },
        {
          label: 'Pending your approval',
          value: String(stats.pendingApprovals),
          detail: stats.compOffPending > 0 ? `${stats.compOffPending} comp-off also waiting` : undefined,
          icon: ListChecks,
          tone: 'warning',
        },
        {
          label: 'Team on leave today',
          value: String(stats.onLeaveToday),
          icon: Sun,
          tone: 'success',
        },
      ]}
    />
  )
}
