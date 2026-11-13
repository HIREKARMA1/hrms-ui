/**
 * Set approval delegate for a date range (demo workflow on Approvals tab).
 */

import { UserCog } from 'lucide-react'
import { useState } from 'react'

import { useLeave } from '../../hooks/useLeave'
import { useLeaveViewer } from '../../hooks/useLeaveViewer'
import { leaveTodayIso } from '../../utils/leaveToday'
import { formatDate } from '../../utils/formatDate'
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

type SetDelegateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function SetDelegateDialog({ open, onOpenChange, onSubmit }: SetDelegateDialogProps) {
  const { snapshot } = useLeave()
  const { viewer } = useLeaveViewer()
  const [delegateId, setDelegateId] = useState('')
  const [from, setFrom] = useState(leaveTodayIso())
  const [to, setTo] = useState(leaveTodayIso())
  if (!snapshot) return null
  const peers = snapshot.employees.filter((e) => e.id !== viewer.employeeId)
  const delegate = peers.find((e) => e.id === delegateId)?.name ?? 'delegate'

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md">
        <LeaveDialogHeader title="Set delegate" subtitle="Route approvals while you are away." icon={UserCog} />
        <LeaveDialogBody className="space-y-4">
          <LeaveDialogField label="Delegate" htmlFor="del-emp" required>
            <select id="del-emp" className={cn(LEAVE_DIALOG_SELECT)} value={delegateId} onChange={(e) => setDelegateId(e.target.value)}>
              <option value="">Select employee</option>
              {peers.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </LeaveDialogField>
          <div className="grid gap-3 sm:grid-cols-2">
            <LeaveDialogField label="From" htmlFor="del-from">
              <input id="del-from" type="date" className={LEAVE_DIALOG_INPUT} value={from} onChange={(e) => setFrom(e.target.value)} />
            </LeaveDialogField>
            <LeaveDialogField label="To" htmlFor="del-to">
              <input id="del-to" type="date" className={LEAVE_DIALOG_INPUT} value={to} onChange={(e) => setTo(e.target.value)} />
            </LeaveDialogField>
          </div>
          {delegateId ? (
            <p className="text-sm text-hrms-text-secondary">
              Requests for {viewer.displayName} will go to {delegate} from {formatDate(from)} to {formatDate(to)}.
            </p>
          ) : null}
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions primaryLabel="Save delegate" primaryDisabled={!delegateId} onPrimary={() => { onSubmit(); onOpenChange(false) }} />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
