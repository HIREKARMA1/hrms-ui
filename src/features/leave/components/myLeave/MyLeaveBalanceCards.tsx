/**
 * Compact balance grid per enabled leave type for the signed-in viewer.
 * Rendered on My Leave tab below the stat row.
 */

import { Card, CardContent } from '@/components/ui/card'

import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../../constants/leaveTypeCodes'
import type { CompOffLot } from '../../types/compOff'
import { formatDate } from '../../utils/formatDate'
import { addDays } from '../../utils/leaveDates'
import { leaveTodayIso } from '../../utils/leaveToday'

export type BalanceCardModel = {
  code: LeaveTypeCode
  available: number
  used: number
  pending: number
  hint?: string
}

type MyLeaveBalanceCardsProps = {
  cards: BalanceCardModel[]
  compOffLots: CompOffLot[]
  employeeId: string
}

export function MyLeaveBalanceCards({ cards, compOffLots, employeeId }: MyLeaveBalanceCardsProps) {
  const soon = compOffLots.filter(
    (lot) =>
      lot.employeeId === employeeId &&
      lot.status === 'Available' &&
      lot.expiresOn <= addDays(leaveTodayIso(), 14),
  )
  const earliest = compOffLots
    .filter((lot) => lot.employeeId === employeeId && lot.status === 'Available')
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))[0]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.code} className="h-fit">
          <CardContent className="space-y-1 p-4 text-sm">
            <p className="font-semibold text-hrms-navy">{LEAVE_TYPE_LABELS[card.code]}</p>
            <p>Available: {card.available}</p>
            <p>Used: {card.used}</p>
            <p>Pending approval: {card.pending}</p>
            {card.hint ? <p className="text-xs text-hrms-text-secondary">{card.hint}</p> : null}
            {card.code === 'CO' && earliest ? (
              <p className="text-xs text-hrms-text-muted">Expires on: {formatDate(earliest.expiresOn)}</p>
            ) : null}
            {card.code === 'CO' && soon.length > 0 ? (
              <p className="text-xs font-medium text-hrms-warning">Credit expiring within 14 days</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
