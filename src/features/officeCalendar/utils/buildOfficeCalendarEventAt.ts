const LOCAL_OFFSET = '+05:30'



function padTime(hhmm?: string, fallback = '09:00'): string {

  const value = (hhmm ?? fallback).trim()

  return /^\d{2}:\d{2}$/.test(value) ? value : fallback

}



/** Builds ISO-8601 `startAt` / `endAt` for the calendar events API (IST offset). */

export function buildOfficeCalendarEventAt(

  date: string,

  time: string | undefined,

  allDay: boolean,

  kind: 'start' | 'end',

): string {

  const day = date.slice(0, 10)

  if (allDay) {

    return kind === 'start' ? `${day}T00:00:00.000${LOCAL_OFFSET}` : `${day}T23:59:59.000${LOCAL_OFFSET}`

  }

  const clock = padTime(time, kind === 'start' ? '09:00' : '10:00')

  return `${day}T${clock}:00.000${LOCAL_OFFSET}`

}
