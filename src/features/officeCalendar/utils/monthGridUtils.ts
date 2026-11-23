import type { DayMarker } from './buildEventsByDay'
import { toDateKey } from './formatOfficeCalendarDate'

export const MONTH_GRID_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export type MonthGridCell = {
  date: Date
  key: string
  inMonth: boolean
  marker?: DayMarker
}

export function startOfMonthGrid(month: Date): Date {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const day = first.getDay()
  const offset = day === 0 ? 6 : day - 1
  const start = new Date(first)
  start.setDate(first.getDate() - offset)
  return start
}

export function buildMonthGridCells(
  month: Date,
  byDay: Record<string, DayMarker>,
): MonthGridCell[] {
  const start = startOfMonthGrid(month)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const key = toDateKey(date)
    const inMonth = date.getMonth() === month.getMonth()
    return { date, key, inMonth, marker: byDay[key] }
  })
}