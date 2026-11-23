/**
 * Calendar tab state: month, selection, category filters, derived lists.
 */

import { useCallback, useMemo, useState } from 'react'

import type { OfficeCalendarScheduleCategory } from '../constants/officeCalendarScheduleCategoryColors'
import { OFFICE_CALENDAR_SCHEDULE_CATEGORIES } from '../constants/officeCalendarScheduleCategoryColors'
import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'
import {
  buildScheduleItems,
  itemsForDate,
  monthCategoryCounts,
  upcomingAfterDate,
} from '../utils/officeCalendarScheduleItems'
import { formatOfficeDate, startOfMonth, toDateKey } from '../utils/formatOfficeCalendarDate'

export function useOfficeCalendarScheduleView(holidays: OfficeHoliday[], events: OfficeCalendarEvent[]) {
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey)
  const [hidden, setHidden] = useState<Set<OfficeCalendarScheduleCategory>>(() => new Set())

  const allItems = useMemo(() => buildScheduleItems(holidays, events), [holidays, events])
  const counts = useMemo(() => monthCategoryCounts(month, holidays, events), [month, holidays, events])

  const isVisible = useCallback(
    (category: OfficeCalendarScheduleCategory) => !hidden.has(category),
    [hidden],
  )

  const toggleCategory = useCallback((category: OfficeCalendarScheduleCategory) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }, [])

  const handleSelectDate = useCallback(
    (dateKey: string) => {
      setSelectedDateKey(dateKey)
      const selected = new Date(`${dateKey}T12:00:00`)
      if (selected.getMonth() !== month.getMonth() || selected.getFullYear() !== month.getFullYear()) {
        setMonth(startOfMonth(selected))
      }
    },
    [month],
  )

  const goToday = useCallback(() => {
    setMonth(startOfMonth(new Date()))
    setSelectedDateKey(todayKey)
  }, [todayKey])

  const agendaTitle = formatOfficeDate(selectedDateKey, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const dayItems = useMemo(
    () => itemsForDate(allItems, selectedDateKey, isVisible),
    [allItems, selectedDateKey, isVisible],
  )

  const upcomingItems = useMemo(
    () => upcomingAfterDate(allItems, selectedDateKey, isVisible, 4),
    [allItems, selectedDateKey, isVisible],
  )

  return {
    todayKey,
    month,
    setMonth,
    selectedDateKey,
    handleSelectDate,
    goToday,
    agendaTitle,
    dayItems,
    upcomingItems,
    counts,
    hidden,
    toggleCategory,
    isVisible,
    categories: OFFICE_CALENDAR_SCHEDULE_CATEGORIES,
    allItems,
  }
}