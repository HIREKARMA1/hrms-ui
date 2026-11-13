/**
 * Calendar day detail dialog listing holidays and employees on leave.
 */

import { CalendarDays } from 'lucide-react'

import { formatDate } from '../../utils/formatDate'
import { LeaveTypeChip } from '../LeaveTypeChip'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'

type CalendarDayDetailDialogProps = {
  open: boolean
  day: string | null
  holidays: string[]
  onLeave: { code: string; label: string }[]
  onOpenChange: (open: boolean) => void
  variant?: 'team' | 'self'
}

export function CalendarDayDetailDialog({
  open,
  day,
  holidays,
  onLeave,
  onOpenChange,
  variant = 'team',
}: CalendarDayDetailDialogProps) {
  const self = variant === 'self'
  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md">
        <LeaveDialogHeader
          title={day ? formatDate(day) : 'Day'}
          subtitle={self ? 'Your holidays and leave' : 'Holidays and leave'}
          icon={CalendarDays}
        />
        <LeaveDialogBody className="space-y-4">
          <section>
            <h3 className="text-sm font-semibold text-hrms-navy">Holidays</h3>
            <ul className="mt-1 text-sm text-hrms-text-secondary">
              {holidays.length ? holidays.map((name) => <li key={name}>{name}</li>) : <li>None</li>}
            </ul>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-hrms-navy">{self ? 'Your leave' : 'On leave'}</h3>
            <ul className="mt-2 space-y-2">
              {onLeave.length ? (
                onLeave.map((row, index) => (
                  <li key={`${row.code}-${index}`} className="flex items-center justify-between gap-2 text-sm">
                    <span>{row.label}</span>
                    <LeaveTypeChip code={row.code} abbreviated />
                  </li>
                ))
              ) : (
                <li className="text-sm text-hrms-text-secondary">{self ? 'No leave on this day' : 'No approved leave'}</li>
              )}
            </ul>
          </section>
        </LeaveDialogBody>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
