/**
 * Shared Radix dialog shell for payroll modals (overlay, header, body, footer).
 * Used by variable pay dialogs, run payroll, and settlement detail.
 */

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  PAYROLL_DIALOG_CONTENT_BASE,
  PAYROLL_DIALOG_OVERLAY,
  PAYROLL_DIALOG_SIZE_MD,
  PAYROLL_DIALOG_SIZE_SM,
  PAYROLL_MOTION,
  PAYROLL_SECONDARY_BUTTON,
} from './payrollUi'

export const PayrollDialogRoot = Dialog.Root

type PayrollDialogContentProps = {
  size?: 'sm' | 'md'
  className?: string
  children: ReactNode
  'aria-describedby'?: string
}

export function PayrollDialogPortal({ children }: { children: ReactNode }) {
  return <Dialog.Portal>{children}</Dialog.Portal>
}

export function PayrollDialogOverlay() {
  return <Dialog.Overlay className={PAYROLL_DIALOG_OVERLAY} />
}

export function PayrollDialogContent({
  size = 'sm',
  className,
  children,
  'aria-describedby': describedBy,
}: PayrollDialogContentProps) {
  return (
    <Dialog.Content
      aria-describedby={describedBy}
      className={cn(
        PAYROLL_DIALOG_CONTENT_BASE,
        size === 'md' ? PAYROLL_DIALOG_SIZE_MD : PAYROLL_DIALOG_SIZE_SM,
        className,
      )}
    >
      {children}
    </Dialog.Content>
  )
}

type PayrollDialogHeaderProps = {
  title: string
  description?: string
  descriptionId?: string
  children?: ReactNode
}

export function PayrollDialogHeader({
  title,
  description,
  descriptionId,
  children,
}: PayrollDialogHeaderProps) {
  return (
    <header className="shrink-0 border-b border-hrms-border px-6 py-4 pr-12">
      <Dialog.Title className="text-lg font-semibold text-hrms-navy">{title}</Dialog.Title>
      {description ? (
        <Dialog.Description
          id={descriptionId}
          className="mt-1 text-sm text-hrms-text-secondary"
        >
          {description}
        </Dialog.Description>
      ) : null}
      {children}
    </header>
  )
}

export function PayrollDialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4 text-sm', className)}>
      {children}
    </div>
  )
}

export function PayrollDialogFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <footer className={cn('shrink-0 border-t border-hrms-border px-6 py-4', className)}>{children}</footer>
  )
}

export function PayrollDialogCloseButton() {
  return (
    <Dialog.Close
      className={cn(
        'absolute top-4 right-4 rounded-md p-1 text-hrms-text-muted hover:text-hrms-navy',
        PAYROLL_MOTION,
      )}
    >
      <X className="h-4 w-4" aria-hidden />
      <span className="sr-only">Close</span>
    </Dialog.Close>
  )
}

export function PayrollDialogFooterActions({
  onCancel,
  primaryLabel,
  onPrimary,
  primaryDisabled,
}: {
  onCancel?: () => void
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
}) {
  return (
    <div className="flex justify-end gap-2">
      <Dialog.Close asChild>
        <Button type="button" variant="outline" className={PAYROLL_SECONDARY_BUTTON} onClick={onCancel}>
          Cancel
        </Button>
      </Dialog.Close>
      <Button type="button" disabled={primaryDisabled} onClick={onPrimary}>
        {primaryLabel}
      </Button>
    </div>
  )
}
