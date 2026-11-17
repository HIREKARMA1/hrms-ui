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

import { useOfficeEventFormDialog } from '../hooks/useOfficeEventFormDialog'
import type { OfficeCalendarEvent } from '../types/officeCalendar'
import { OfficeEventFormFields } from './events/OfficeEventFormFields'
import { CALENDAR_DIALOG_HEADER_BAND, CALENDAR_DIALOG_SHELL } from './shared/officeCalendarUi'

type OfficeEventFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initial?: OfficeCalendarEvent | null
  defaultStartDate?: string
  onSaved?: (event: OfficeCalendarEvent) => void
}

export function OfficeEventFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  defaultStartDate,
  onSaved,
}: OfficeEventFormDialogProps) {
  const { draft, setDraft, error, saving, handleSubmit } = useOfficeEventFormDialog({
    open,
    mode,
    initial,
    defaultStartDate,
    onSaved,
    onOpenChange,
  })

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="md"
          className={`flex max-h-[min(90vh,720px)] flex-col p-0 ${CALENDAR_DIALOG_SHELL}`}
          aria-describedby={undefined}
        >
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className={`relative ${CALENDAR_DIALOG_HEADER_BAND}`}>
              <PayrollDialogHeader
                title={mode === 'create' ? 'Schedule event' : 'Edit event'}
                description="Saved to the mock calendar store until API is connected."
              />
              <PayrollDialogCloseButton />
            </div>
            <PayrollDialogBody className="grid gap-3 sm:grid-cols-2">
              <OfficeEventFormFields draft={draft} setDraft={setDraft} error={error} />
            </PayrollDialogBody>
            <PayrollDialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-hrms-primary text-white">
                {saving ? 'Saving…' : mode === 'create' ? 'Create event' : 'Save changes'}
              </Button>
            </PayrollDialogFooter>
          </form>
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}