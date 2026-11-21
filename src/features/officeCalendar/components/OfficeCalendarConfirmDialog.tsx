import { Button } from '@/components/ui/button'

import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '@/features/payroll/components/shared/PayrollDialog'

import {
  OFFICE_CALENDAR_CONFIRM_DEFAULTS,
  type OfficeCalendarConfirmVariant,
} from '../context/officeCalendarConfirmContext'
import { CALENDAR_DIALOG_HEADER_BAND, CALENDAR_DIALOG_SHELL } from './shared/officeCalendarUi'

type OfficeCalendarConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  variant: OfficeCalendarConfirmVariant
  footnote?: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function resolveFootnote(
  variant: OfficeCalendarConfirmVariant,
  footnote: string | null | undefined,
): string | null {
  if (footnote === null) return null
  if (footnote !== undefined) return footnote
  if (variant === 'destructive') return OFFICE_CALENDAR_CONFIRM_DEFAULTS.destructiveFootnote
  return null
}

export function OfficeCalendarConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  variant,
  footnote,
  onOpenChange,
  onConfirm,
}: OfficeCalendarConfirmDialogProps) {
  const bodyText = resolveFootnote(variant, footnote)

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent size="sm" className={`flex flex-col p-0 ${CALENDAR_DIALOG_SHELL}`}>
          <div className={`relative ${CALENDAR_DIALOG_HEADER_BAND}`}>
            <PayrollDialogHeader title={title} description={description} />
            <PayrollDialogCloseButton />
          </div>
          {bodyText ? (
            <PayrollDialogBody className="text-sm text-hrms-text-secondary">{bodyText}</PayrollDialogBody>
          ) : null}
          <PayrollDialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={variant === 'default' ? 'default' : undefined}
              className={
                variant === 'destructive'
                  ? 'bg-hrms-danger text-white hover:bg-hrms-danger/90'
                  : undefined
              }
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </PayrollDialogFooter>
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}