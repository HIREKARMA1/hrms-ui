/**
 * Unified schedule rows for the Calendar tab grid, agenda and upcoming list.
 */

import type { OfficeCalendarScheduleCategory } from '../constants/officeCalendarScheduleCategoryColors'
import { eventTypeToScheduleCategory } from '../constants/officeCalendarScheduleCategoryColors'
import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'

export type OfficeCalendarScheduleItem = {
  id: string
  dateKey: string
  category: OfficeCalendarScheduleCategory
  title: string
  startTime?: string
  endTime?: string
  allDay: boolean
  organizerName: string
  isCompanyHoliday: boolean
}

function eventOnDate(event: OfficeCalendarEvent, dateKey: string): boolean {
  return event.startDate <= dateKey && event.endDate >= dateKey
}

export function buildScheduleItems(
  holidays: OfficeHoliday[],
  events: OfficeCalendarEvent[],
): OfficeCalendarScheduleItem[] {
  const rows: OfficeCalendarScheduleItem[] = holidays.map((item) => ({
    id: `holiday-${item.id}`,
    dateKey: item.date,
    category: 'holiday',
    title: item.name,
    allDay: true,
    organizerName: '',
    isCompanyHoliday: true,
  }))
  for (const event of events) {
    const start = new Date(`${event.startDate}T12:00:00`)
    const end = new Date(`${event.endDate}T12:00:00`)
    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const key = cursor.toISOString().slice(0, 10)
      rows.push({
        id: `${event.id}-${key}`,
        dateKey: key,
        category: eventTypeToScheduleCategory(event.type),
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        allDay: event.allDay,
        organizerName: event.organizerName,
        isCompanyHoliday: false,
      })
    }
  }
  return rows
}

export function itemsForDate(
  items: OfficeCalendarScheduleItem[],
  dateKey: string,
  visible: (category: OfficeCalendarScheduleCategory) => boolean,
): OfficeCalendarScheduleItem[] {
  return items.filter((item) => item.dateKey === dateKey && visible(item.category))
}

export function monthPrefix(month: Date): string {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
}

export function monthCategoryCounts(
  month: Date,
  holidays: OfficeHoliday[],
  events: OfficeCalendarEvent[],
): Record<OfficeCalendarScheduleCategory, number> {
  const prefix = monthPrefix(month)
  const counts: Record<OfficeCalendarScheduleCategory, number> = {
    holiday: 0,
    weeklyOff: 0,
    event: 0,
    meeting: 0,
    training: 0,
  }
  for (const holiday of holidays) {
    if (holiday.date.startsWith(prefix)) counts.holiday += 1
  }
  for (const event of events) {
    if (!event.startDate.startsWith(prefix)) continue
    counts[eventTypeToScheduleCategory(event.type)] += 1
  }
  return counts
}

export function scheduleCategoryCounts(
  month: Date,
  items: OfficeCalendarScheduleItem[],
): Record<OfficeCalendarScheduleCategory, number> {
  const prefix = monthPrefix(month)
  const counts: Record<OfficeCalendarScheduleCategory, number> = {
    holiday: 0,
    weeklyOff: 0,
    event: 0,
    meeting: 0,
    training: 0,
  }
  for (const item of items) {
    if (!item.dateKey.startsWith(prefix)) continue
    counts[item.category] += 1
  }
  return counts
}

export function upcomingAfterDate(
  items: OfficeCalendarScheduleItem[],
  afterDateKey: string,
  visible: (category: OfficeCalendarScheduleCategory) => boolean,
  limit = 4,
): OfficeCalendarScheduleItem[] {
  return [...items]
    .filter((item) => item.dateKey > afterDateKey && visible(item.category))
    .sort((a, b) =>
      `${a.dateKey}${a.startTime ?? ''}`.localeCompare(`${b.dateKey}${b.startTime ?? ''}`),
    )
    .slice(0, limit)
}

export function formatScheduleTime(item: OfficeCalendarScheduleItem): string {
  if (item.allDay || item.category === 'holiday' || item.category === 'weeklyOff') return 'All day'
  if (!item.startTime) return '—'
  return item.endTime ? `${item.startTime}–${item.endTime}` : item.startTime
}

export function formatScheduleTooltip(item: OfficeCalendarScheduleItem): string {
  return `${item.title} · ${formatScheduleTime(item)}`
}

export { eventOnDate }