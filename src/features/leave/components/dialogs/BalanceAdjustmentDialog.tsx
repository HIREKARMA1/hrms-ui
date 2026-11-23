/**
 * Nested sm dialog to add a ledger adjustment row (demo UI).
 */

import { PlusCircle } from 'lucide-react'
import { useState } from 'react'

import { BALANCE_TYPE_CODES } from '../../constants/leaveTypeCodes'
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

type BalanceAdjustmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function BalanceAdjustmentDialog({ open, onOpenChange, onSaved }: BalanceAdjustmentDialogProps) {
  const [code, setCode] = useState(BALANCE_TYPE_CODES[0])
  const [days, setDays] = useState(1)
  const [kind, setKind] = useState('Adjustment')
  const [reason, setReason] = useState('')

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="sm">
        <LeaveDialogHeader title="Add adjustment" subtitle="Creates a new ledger entry." icon={PlusCircle} />
        <LeaveDialogBody className="space-y-3">
          <LeaveDialogField label="Type" htmlFor="adj-type">
            <select id="adj-type" className={cn(LEAVE_DIALOG_SELECT)} value={code} onChange={(e) => setCode(e.target.value as typeof code)}>
              {BALANCE_TYPE_CODES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </LeaveDialogField>
          <LeaveDialogField label="Days" htmlFor="adj-days">
            <input id="adj-days" type="number" className={LEAVE_DIALOG_INPUT} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </LeaveDialogField>
          <LeaveDialogField label="Kind" htmlFor="adj-kind">
            <select id="adj-kind" className={cn(LEAVE_DIALOG_SELECT)} value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="Adjustment">Adjustment</option>
              <option value="Accrual">Accrual</option>
            </select>
          </LeaveDialogField>
          <LeaveDialogField label="Reason" htmlFor="adj-reason" required>
            <input id="adj-reason" className={LEAVE_DIALOG_INPUT} value={reason} onChange={(e) => setReason(e.target.value)} />
          </LeaveDialogField>
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions primaryLabel="Save" primaryDisabled={!reason.trim()} onPrimary={() => { onSaved(); onOpenChange(false) }} />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
