/**
 * Employee-focused stat row: totals, next leave, pending, and comp-off balance.
 */

import { CalendarClock, CalendarDays, Clock, Coins } from 'lucide-react'

import type { CompOffLot } from '../../types/compOff'
import type { LeaveRequest } from '../../types/leaveRequest'
import { availableCompOffDays, nextLeaveSummary, totalAvailableDays } from '../../utils/myLeaveEmployeeInsights'
import { LeaveStatGrid } from '../LeaveStatGrid'
import type { BalanceCardModel } from './MyLeaveBalanceCards'

type MyLeaveEmployeeOverviewProps = {
  cards: BalanceCardModel[]
  requests: LeaveRequest[]
  compOffLots: CompOffLot[]
  employeeId: string
}

export function MyLeaveEmployeeOverview({ cards, requests, compOffLots, employeeId }: MyLeaveEmployeeOverviewProps) {
  const next = nextLeaveSummary(requests)
  const compDays = availableCompOffDays(compOffLots, employeeId)

  return (
    <LeaveStatGrid
      items={[
        {
          label: 'Available days',
          value: String(totalAvailableDays(cards)),
          detail: 'Across leave types with balance',
          icon: CalendarDays,
          tone: 'primary',
        },
        {
          label: 'Next leave',
          value: next.value,
          detail: next.detail,
          icon: CalendarClock,
          tone: 'success',
        },
        {
          label: 'Pending requests',
          value: String(requests.filter((item) => item.status === 'Pending').length),
          icon: Clock,
          tone: 'warning',
        },
        {
          label: 'Comp-off available',
          value: String(compDays),
          detail: compDays > 0 ? 'Credited days not yet used' : undefined,
          icon: Coins,
          tone: 'neutral',
        },
      ]}
    />
  )
}
