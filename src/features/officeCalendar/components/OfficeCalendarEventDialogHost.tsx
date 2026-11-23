import { OfficeEventDetailDialog } from './OfficeEventDetailDialog'
import { OfficeEventFormDialog } from './OfficeEventFormDialog'
import type { EventFormState } from '../hooks/useOfficeCalendarEventDialogs'
import type { OfficeCalendarEvent } from '../types/officeCalendar'

type OfficeCalendarEventDialogHostProps = {
  eventForm: EventFormState
  setEventFormOpen: (open: boolean) => void
  detailEvent: OfficeCalendarEvent | null
  detailOpen: boolean
  onDetailOpenChange: (open: boolean) => void
  canEditEvents: boolean
  canDeleteEvents: boolean
  onEditDetail: () => void
  onDetailDeleted: () => void
}

export function OfficeCalendarEventDialogHost({
  eventForm,
  setEventFormOpen,
  detailEvent,
  detailOpen,
  onDetailOpenChange,
  canEditEvents,
  canDeleteEvents,
  onEditDetail,
  onDetailDeleted,
}: OfficeCalendarEventDialogHostProps) {
  return (
    <>
      <OfficeEventFormDialog
        open={eventForm.open}
        onOpenChange={setEventFormOpen}
        mode={eventForm.mode}
        initial={eventForm.event}
        defaultStartDate={eventForm.defaultStartDate}
      />
      <OfficeEventDetailDialog
        event={detailEvent}
        open={detailOpen}
        onOpenChange={onDetailOpenChange}
        canEdit={canEditEvents}
        canDelete={canDeleteEvents}
        onEdit={onEditDetail}
        onDeleted={onDetailDeleted}
      />
    </>
  )
}