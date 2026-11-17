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

import { CALENDAR_DIALOG_HEADER_BAND, CALENDAR_DIALOG_SHELL } from './shared/officeCalendarUi'

type OfficeCalendarConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function OfficeCalendarConfirmDialog({
  open,
  title,
  description,
  onOpenChange,
  onConfirm,
}: OfficeCalendarConfirmDialogProps) {
  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent size="sm" className={`flex flex-col p-0 ${CALENDAR_DIALOG_SHELL}`}>
          <div className={`relative ${CALENDAR_DIALOG_HEADER_BAND}`}>
            <PayrollDialogHeader title={title} description={description} />
            <PayrollDialogCloseButton />
          </div>
          <PayrollDialogBody className="text-sm text-hrms-text-secondary">
            This action uses mock data only and cannot be undone in the current preview.
          </PayrollDialogBody>
          <PayrollDialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-hrms-danger text-white hover:bg-hrms-danger/90"
              onClick={onConfirm}
            >
              Delete
            </Button>
          </PayrollDialogFooter>
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}