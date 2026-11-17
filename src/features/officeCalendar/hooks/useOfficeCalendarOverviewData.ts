import { useMemo } from 'react'

import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'
import { toDateKey } from '../utils/formatOfficeCalendarDate'

export function useOfficeCalendarOverviewData(holidays: OfficeHoliday[], events: OfficeCalendarEvent[]) {
  const todayKey = useMemo(() => toDateKey(new Date()), [])

  const todayHolidays = useMemo(
    () => holidays.filter((item) => item.date === todayKey),
    [holidays, todayKey],
  )

  const todayEvents = useMemo(
    () =>
      events.filter((item) => {
        if (item.startDate === todayKey || item.endDate === todayKey) return true
        return item.startDate <= todayKey && item.endDate >= todayKey
      }),
    [events, todayKey],
  )

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((item) => item.startDate >= todayKey)
        .sort((a, b) =>
          `${a.startDate}${a.startTime ?? ''}`.localeCompare(`${b.startDate}${b.startTime ?? ''}`),
        )
        .slice(0, 6),
    [events, todayKey],
  )

  const upcomingHolidays = useMemo(
    () =>
      [...holidays]
        .filter((item) => item.date >= todayKey)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [holidays, todayKey],
  )

  const weekEnd = useMemo(() => {
    const end = new Date()
    end.setDate(end.getDate() + 7)
    return toDateKey(end)
  }, [])

  const thisWeekCount = useMemo(
    () => events.filter((item) => item.startDate >= todayKey && item.startDate <= weekEnd).length,
    [events, todayKey, weekEnd],
  )

  return {
    todayKey,
    todayHolidays,
    todayEvents,
    upcomingEvents,
    upcomingHolidays,
    thisWeekCount,
  }
}