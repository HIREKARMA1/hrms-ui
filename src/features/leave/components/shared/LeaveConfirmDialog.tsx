/**
 * Small confirmation dialog on the shared LeaveDialog shell.
 * Used for cancel request, run accrual, and run year-end.
 */

import { HelpCircle } from 'lucide-react'

import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from './LeaveDialog'

type LeaveConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  loading?: boolean
  danger?: boolean
}

export function LeaveConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  loading,
  danger,
}: LeaveConfirmDialogProps) {
  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="sm" describedBy="leave-confirm-desc">
        <LeaveDialogHeader title={title} subtitle={description} subtitleId="leave-confirm-desc" icon={HelpCircle} />
        <LeaveDialogBody className="sr-only">Confirm</LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions
            primaryLabel={confirmLabel}
            onPrimary={onConfirm}
            loading={loading}
            primaryVariant={danger ? 'danger' : 'default'}
          />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
