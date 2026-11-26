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
  apiMode?: boolean
  loading?: boolean
}

export function MyLeaveEmployeeOverview({
  cards,
  requests,
  compOffLots,
  employeeId,
  apiMode = false,
  loading = false,
}: MyLeaveEmployeeOverviewProps) {
  const next = nextLeaveSummary(requests)
  const compDays = availableCompOffDays(compOffLots, employeeId)

  const items = [
    {
      label: 'Available days',
      value: String(totalAvailableDays(cards)),
      detail: 'Across leave types with balance',
      icon: CalendarDays,
      tone: 'primary' as const,
      valueVariant: 'number' as const,
    },
    {
      label: 'Next leave',
      value: next.value,
      detail: next.detail,
      icon: CalendarClock,
      tone: 'success' as const,
      valueVariant: 'text' as const,
    },
    {
      label: 'Pending requests',
      value: String(requests.filter((item) => item.status === 'Pending').length),
      icon: Clock,
      tone: 'warning' as const,
      valueVariant: 'number' as const,
    },
  ]

  if (!apiMode) {
    items.push({
      label: 'Comp-off available',
      value: String(compDays),
      detail: compDays > 0 ? 'Credited days not yet used' : 'No comp-off balance',
      icon: Coins,
      tone: 'primary' as const,
      valueVariant: 'number' as const,
    })
  }

  return <LeaveStatGrid items={items} loading={loading} />
}
