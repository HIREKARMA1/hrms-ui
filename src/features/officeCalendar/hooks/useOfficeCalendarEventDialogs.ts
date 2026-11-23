import { useMemo, useState } from 'react'

import type { OfficeCalendarEvent } from '../types/officeCalendar'
import { toDateKey } from '../utils/formatOfficeCalendarDate'

export type EventFormState = {
  open: boolean
  mode: 'create' | 'edit'
  event: OfficeCalendarEvent | null
  defaultStartDate?: string
}

export function useOfficeCalendarEventDialogs(visibleEvents: OfficeCalendarEvent[]) {
  const [eventForm, setEventForm] = useState<EventFormState>({
    open: false,
    mode: 'create',
    event: null,
  })
  const [detailEventId, setDetailEventId] = useState<string | null>(null)

  const detailEvent = useMemo(() => {
    if (!detailEventId) return null
    return visibleEvents.find((item) => item.id === detailEventId) ?? null
  }, [detailEventId, visibleEvents])

  function openCreateEvent(defaultStartDate?: string) {
    setEventForm({
      open: true,
      mode: 'create',
      event: null,
      defaultStartDate: defaultStartDate ?? toDateKey(new Date()),
    })
  }

  function openEditEvent(event: OfficeCalendarEvent) {
    setEventForm({
      open: true,
      mode: 'edit',
      event,
    })
    setDetailEventId(null)
  }

  return {
    eventForm,
    setEventForm,
    detailEvent,
    detailEventId,
    setDetailEventId,
    openCreateEvent,
    openEditEvent,
  }
}