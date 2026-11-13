/**
 * Stat card row for My Leave tab (sits directly above the filter row).
 */

import { CalendarDays, CheckCircle2, Clock, Coins } from 'lucide-react'

import type { CompOffLot } from '../../types/compOff'
import type { LeaveRequest } from '../../types/leaveRequest'
import { LeaveStatGrid } from '../LeaveStatGrid'
import type { BalanceCardModel } from './MyLeaveBalanceCards'

type MyLeaveTabOverviewProps = {
  cards: BalanceCardModel[]
  requests: LeaveRequest[]
  compOffLots: CompOffLot[]
  employeeId: string
}

export function MyLeaveTabOverview({ cards, requests, compOffLots, employeeId }: MyLeaveTabOverviewProps) {
  return (
    <LeaveStatGrid
      items={[
        {
          label: 'Available CL',
          value: String(cards.find((item) => item.code === 'CL')?.available ?? 0),
          icon: CalendarDays,
          tone: 'primary',
        },
        {
          label: 'Pending requests',
          value: String(requests.filter((item) => item.status === 'Pending').length),
          icon: Clock,
          tone: 'warning',
        },
        {
          label: 'Approved this year',
          value: String(requests.filter((item) => item.status === 'Approved').length),
          icon: CheckCircle2,
          tone: 'success',
        },
        {
          label: 'Comp-off lots',
          value: String(compOffLots.filter((item) => item.employeeId === employeeId).length),
          icon: Coins,
          tone: 'neutral',
        },
      ]}
    />
  )
}
