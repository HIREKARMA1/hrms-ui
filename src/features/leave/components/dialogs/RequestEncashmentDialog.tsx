/**
 * Request leave encashment for encashable types with balance preview.
 */

import { Wallet } from 'lucide-react'
import { useState } from 'react'

import { LEAVE_TYPE_LABELS } from '../../constants/leaveTypeCodes'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { useLeave } from '../../hooks/useLeave'
import { useLeaveViewer } from '../../hooks/useLeaveViewer'
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

type RequestEncashmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function RequestEncashmentDialog({ open, onOpenChange, onSubmit }: RequestEncashmentDialogProps) {
  const { snapshot } = useLeave()
  const { viewer } = useLeaveViewer()
  const [code, setCode] = useState('EL')
  const [days, setDays] = useState(1)
  if (!snapshot) return null
  const encashable = snapshot.settings.leaveTypes.filter((t) => t.encashable)
  const balance = viewer.employeeId ? ledgerBalanceForType(snapshot.ledger, viewer.employeeId, code) : 0
  const minKeep = snapshot.settings.encashmentRules.minimumBalanceDays
  const after = balance - days
  const error = after < minKeep ? `Keep at least ${minKeep} days after encashment.` : days > snapshot.settings.encashmentRules.maximumDaysPerYear ? 'Exceeds yearly maximum.' : ''

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md">
        <LeaveDialogHeader title="Request encashment" subtitle="Encash earned leave per company policy." icon={Wallet} />
        <LeaveDialogBody className="space-y-4">
          <LeaveDialogField label="Leave type" htmlFor="enc-type">
            <select id="enc-type" className={cn(LEAVE_DIALOG_SELECT)} value={code} onChange={(e) => setCode(e.target.value)}>
              {encashable.map((t) => (
                <option key={t.code} value={t.code}>
                  {LEAVE_TYPE_LABELS[t.code as keyof typeof LEAVE_TYPE_LABELS] ?? t.label}
                </option>
              ))}
            </select>
          </LeaveDialogField>
          <LeaveDialogField label="Days to encash" htmlFor="enc-days">
            <input id="enc-days" type="number" min={1} className={LEAVE_DIALOG_INPUT} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </LeaveDialogField>
          <p className="text-sm tabular-nums text-hrms-text-secondary">Balance after: {after} days</p>
          <p className="text-xs text-hrms-text-muted">Minimum balance {minKeep} · Max {snapshot.settings.encashmentRules.maximumDaysPerYear} days per year.</p>
          {error ? <p className="text-xs text-hrms-danger">{error}</p> : null}
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions primaryLabel="Submit" primaryDisabled={Boolean(error) || days < 1} onPrimary={() => { onSubmit(); onOpenChange(false) }} />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
