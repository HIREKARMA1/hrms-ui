/**
 * Centered dialog shell for all leave modals (overlay, header, body, footer).
 * Built on @radix-ui/react-dialog; replaces Sheet panels across the feature.
 */

import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, X, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  LEAVE_DIALOG_CONTENT_BASE,
  LEAVE_DIALOG_MOTION,
  LEAVE_DIALOG_OVERLAY,
  LEAVE_DIALOG_SIZE_LG,
  LEAVE_DIALOG_SIZE_MD,
  LEAVE_DIALOG_SIZE_SM,
  LEAVE_DIALOG_SIZE_XL,
  LEAVE_MOTION,
  LEAVE_SECONDARY_BUTTON,
} from './leaveUi'

export const LeaveDialogRoot = Dialog.Root

type Size = 'sm' | 'md' | 'lg' | 'xl'

export function LeaveDialogContent({
  size = 'sm',
  className,
  children,
  describedBy,
}: {
  size?: Size
  className?: string
  children: ReactNode
  describedBy?: string
}) {
  const sizeClass =
    size === 'xl'
      ? LEAVE_DIALOG_SIZE_XL
      : size === 'lg'
        ? LEAVE_DIALOG_SIZE_LG
        : size === 'md'
          ? LEAVE_DIALOG_SIZE_MD
          : LEAVE_DIALOG_SIZE_SM
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={LEAVE_DIALOG_OVERLAY} />
      <Dialog.Content
        aria-describedby={describedBy}
        className={cn(LEAVE_DIALOG_CONTENT_BASE, LEAVE_DIALOG_MOTION, sizeClass, className)}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export function LeaveDialogHeader({
  title,
  subtitle,
  icon: Icon,
  subtitleId,
  children,
}: {
  title: string
  subtitle?: string
  icon?: LucideIcon
  subtitleId?: string
  children?: ReactNode
}) {
  return (
    <header className="flex shrink-0 items-start gap-3 border-b border-hrms-border px-6 py-4 pr-12">
      {Icon ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hrms-lavender text-hrms-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <Dialog.Title className="text-lg font-semibold text-hrms-navy">{title}</Dialog.Title>
        {subtitle ? (
          <Dialog.Description id={subtitleId} className="mt-1 text-sm text-hrms-text-secondary">
            {subtitle}
          </Dialog.Description>
        ) : null}
        {children}
      </div>
    </header>
  )
}

export function LeaveDialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-4 text-sm', className)}>{children}</div>
}

export function LeaveDialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <footer className={cn('shrink-0 border-t border-hrms-border px-6 py-4', className)}>{children}</footer>
}

export function LeaveDialogCloseButton() {
  return (
    <Dialog.Close className={cn('absolute top-4 right-4 rounded-md p-1 text-hrms-text-muted hover:text-hrms-navy', LEAVE_MOTION)}>
      <X className="h-4 w-4" aria-hidden />
      <span className="sr-only">Close</span>
    </Dialog.Close>
  )
}

export function LeaveDialogFooterActions({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  loading,
  primaryVariant = 'default',
}: {
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  loading?: boolean
  primaryVariant?: 'default' | 'danger'
}) {
  return (
    <div className="flex w-full items-center justify-end gap-2">
      <Dialog.Close asChild>
        <Button type="button" variant="outline" className={LEAVE_SECONDARY_BUTTON} disabled={loading}>
          Cancel
        </Button>
      </Dialog.Close>
      <Button
        type="button"
        variant="default"
        className={primaryVariant === 'danger' ? 'bg-hrms-danger text-white hover:bg-hrms-danger/90' : undefined}
        disabled={primaryDisabled || loading}
        onClick={onPrimary}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
        {loading ? 'Please wait…' : primaryLabel}
      </Button>
    </div>
  )
}
