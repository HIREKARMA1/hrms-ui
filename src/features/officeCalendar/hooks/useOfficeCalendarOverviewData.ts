import { useMemo } from 'react'

import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'
import { toDateKey } from '../utils/formatOfficeCalendarDate'

type OverviewEventOverrides = {
  todayEvents?: OfficeCalendarEvent[]
  upcomingEvents?: OfficeCalendarEvent[]
}

export function useOfficeCalendarOverviewData(
  holidays: OfficeHoliday[],
  events: OfficeCalendarEvent[],
  overrides?: OverviewEventOverrides,
) {
  const todayKey = useMemo(() => toDateKey(new Date()), [])

  const todayHolidays = useMemo(
    () => holidays.filter((item) => item.date === todayKey),
    [holidays, todayKey],
  )

  const todayEvents = useMemo(() => {
    if (overrides?.todayEvents) return overrides.todayEvents
    return events.filter((item) => {
      if (item.startDate === todayKey || item.endDate === todayKey) return true
      return item.startDate <= todayKey && item.endDate >= todayKey
    })
  }, [events, overrides?.todayEvents, todayKey])

  const upcomingEvents = useMemo(() => {
    if (overrides?.upcomingEvents) return overrides.upcomingEvents
    return [...events]
      .filter((item) => item.startDate >= todayKey)
      .sort((a, b) =>
        `${a.startDate}${a.startTime ?? ''}`.localeCompare(`${b.startDate}${b.startTime ?? ''}`),
      )
      .slice(0, 6)
  }, [events, overrides?.upcomingEvents, todayKey])

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

  const thisWeekCount = useMemo(() => {
    const source = overrides?.upcomingEvents ?? events
    return source.filter((item) => item.startDate >= todayKey && item.startDate <= weekEnd).length
  }, [events, overrides?.upcomingEvents, todayKey, weekEnd])

  return {
    todayKey,
    todayHolidays,
    todayEvents,
    upcomingEvents,
    upcomingHolidays,
    thisWeekCount,
  }
}