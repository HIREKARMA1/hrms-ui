import type { ReactNode } from 'react'

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

import { getApiErrorMessage } from '@/services/api/errors'

import { useOfficeCalendar } from '../hooks/useOfficeCalendar'
import { useOfficeCalendarConfirm } from '../hooks/useOfficeCalendarConfirm'
import { useOfficeCalendarToast } from '../hooks/useOfficeCalendarToast'
import type { OfficeCalendarEvent } from '../types/officeCalendar'
import { formatOfficeDate } from '../utils/formatOfficeCalendarDate'
import { CALENDAR_DIALOG_HEADER_BAND, CALENDAR_DIALOG_SHELL } from './shared/officeCalendarUi'

type OfficeEventDetailDialogProps = {
  event: OfficeCalendarEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canEdit: boolean
  canDelete: boolean
  onEdit: () => void
  onDeleted?: () => void
}

export function OfficeEventDetailDialog({
  event,
  open,
  onOpenChange,
  canEdit,
  canDelete,
  onEdit,
  onDeleted,
}: OfficeEventDetailDialogProps) {
  const { removeEvent } = useOfficeCalendar()
  const { showToast } = useOfficeCalendarToast()
  const { requestConfirm } = useOfficeCalendarConfirm()

  if (!event) return null

  async function handleDelete() {
    if (!event) return
    const confirmed = await requestConfirm({
      title: 'Delete event?',
      description: `Remove “${event.title}” from the office calendar.`,
    })
    if (!confirmed) return
    try {
      await removeEvent(event.id)
      showToast('Event deleted.')
      onDeleted?.()
      onOpenChange(false)
    } catch (cause) {
      showToast(getApiErrorMessage(cause, 'Could not delete event.'))
    }
  }

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="sm"
          className={`flex flex-col p-0 ${CALENDAR_DIALOG_SHELL}`}
          aria-describedby={undefined}
        >
          <div className={`relative ${CALENDAR_DIALOG_HEADER_BAND}`}>
            <PayrollDialogHeader title={event.title} description={event.type} />
            <PayrollDialogCloseButton />
          </div>
          <PayrollDialogBody className="space-y-3 text-sm">
            <DetailRow label="When">
              {formatOfficeDate(event.startDate)}
              {event.endDate !== event.startDate ? ` → ${formatOfficeDate(event.endDate)}` : ''}
              {event.allDay
                ? ' · All day'
                : event.startTime
                  ? ` · ${event.startTime}${event.endTime ? `–${event.endTime}` : ''}`
                  : ''}
            </DetailRow>
            <DetailRow label="Organizer">{event.organizerName}</DetailRow>
            <DetailRow label="Visibility" className="capitalize">
              {event.visibility}
            </DetailRow>
            {event.description ? (
              <DetailRow label="Notes">{event.description}</DetailRow>
            ) : null}
          </PayrollDialogBody>
          <PayrollDialogFooter className="gap-2">
            {canEdit || canDelete ? (
              <>
                {canEdit ? (
                  <Button type="button" variant="outline" onClick={onEdit}>
                    Edit
                  </Button>
                ) : null}
                {canDelete ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-hrms-danger hover:text-hrms-danger"
                    onClick={() => void handleDelete()}
                  >
                    Delete
                  </Button>
                ) : null}
              </>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </PayrollDialogFooter>
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}

function DetailRow({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-hrms-text-muted">{label}</p>
      <p className={`mt-0.5 text-hrms-navy ${className ?? ''}`}>{children}</p>
    </div>
  )
}