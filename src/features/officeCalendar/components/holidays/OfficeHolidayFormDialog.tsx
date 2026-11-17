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

import { useOfficeHolidayFormDialog } from '../../hooks/useOfficeHolidayFormDialog'
import type { OfficeHoliday, OfficeHolidayInput } from '../../types/officeCalendar'
import { CALENDAR_DIALOG_HEADER_BAND, CALENDAR_DIALOG_SHELL } from '../shared/officeCalendarUi'
import { OfficeHolidayFormFields } from './OfficeHolidayFormFields'

type OfficeHolidayFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initial?: OfficeHoliday | null
  onSave: (input: OfficeHolidayInput, id?: string) => Promise<OfficeHoliday>
}

export function OfficeHolidayFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  onSave,
}: OfficeHolidayFormDialogProps) {
  const { draft, setDraft, error, saving, handleSubmit } = useOfficeHolidayFormDialog({
    open,
    mode,
    initial,
    onSave,
    onOpenChange,
  })

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="md"
          className={`flex max-h-[min(90vh,640px)] flex-col p-0 ${CALENDAR_DIALOG_SHELL}`}
          aria-describedby={undefined}
        >
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className={`relative ${CALENDAR_DIALOG_HEADER_BAND}`}>
              <PayrollDialogHeader
                title={mode === 'create' ? 'Add holiday' : 'Edit holiday'}
                description="Office calendar holidays (mock). Not synced with Attendance yet."
              />
              <PayrollDialogCloseButton />
            </div>
            <PayrollDialogBody className="grid gap-3 sm:grid-cols-2">
              <OfficeHolidayFormFields draft={draft} setDraft={setDraft} />
              {error ? (
                <p className="sm:col-span-2 text-sm text-hrms-danger" role="alert">
                  {error}
                </p>
              ) : null}
            </PayrollDialogBody>
            <PayrollDialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-hrms-primary text-white">
                {saving ? 'Saving…' : mode === 'create' ? 'Add holiday' : 'Save changes'}
              </Button>
            </PayrollDialogFooter>
          </form>
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}