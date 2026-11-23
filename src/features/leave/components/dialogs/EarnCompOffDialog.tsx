/**
 * Earn comp-off dialog with worked date validation hint and expiry summary.
 */

import { Gift } from 'lucide-react'
import { useState } from 'react'

import { addDays } from '../../utils/leaveDates'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveDialogField } from '../shared/LeaveDialogField'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_SELECT } from '../shared/leaveUi'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { cn } from '@/lib/utils'

type EarnCompOffDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function EarnCompOffDialog({ open, onOpenChange, onSubmit }: EarnCompOffDialogProps) {
  const [workedDate, setWorkedDate] = useState(leaveTodayIso())
  const [portion, setPortion] = useState<'full' | 'half'>('full')
  const [reason, setReason] = useState('')
  const isWeeklyOff = new Date(`${workedDate}T12:00:00`).getDay() === 0

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md">
        <LeaveDialogHeader
          title="Earn comp-off"
          subtitle="Credit for working on a holiday or weekly off."
          icon={Gift}
        />
        <LeaveDialogBody className="space-y-4">
          <LeaveDialogField label="Worked date" htmlFor="co-date" required>
            <input id="co-date" type="date" className={LEAVE_DIALOG_INPUT} value={workedDate} onChange={(e) => setWorkedDate(e.target.value)} />
          </LeaveDialogField>
          {!isWeeklyOff ? (
            <p className="text-xs text-hrms-warning">This date is not marked as a weekly off in the demo calendar; confirm with HR.</p>
          ) : (
            <p className="text-xs text-hrms-text-secondary">Weekly off selected — eligible for comp-off credit.</p>
          )}
          <LeaveDialogField label="Duration" htmlFor="co-portion">
            <select id="co-portion" className={cn(LEAVE_DIALOG_SELECT)} value={portion} onChange={(e) => setPortion(e.target.value as 'full' | 'half')}>
              <option value="full">Full day</option>
              <option value="half">Half day</option>
            </select>
          </LeaveDialogField>
          <LeaveDialogField label="Reason" htmlFor="co-reason" required>
            <input id="co-reason" className={LEAVE_DIALOG_INPUT} value={reason} onChange={(e) => setReason(e.target.value)} />
          </LeaveDialogField>
          <p className="text-sm text-hrms-navy">Expires on {formatInline(addDays(workedDate, 90))}</p>
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions primaryLabel="Submit" primaryDisabled={!reason.trim()} onPrimary={() => { onSubmit(); onOpenChange(false) }} />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}

function formatInline(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
