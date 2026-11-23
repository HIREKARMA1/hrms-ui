import type { OfficeHoliday, OfficeHolidayType } from '../types/officeCalendar'

export type OfficeHolidayFilterState = {
  query: string
  type: OfficeHolidayType | 'all'
}

export function filterOfficeHolidays(
  holidays: OfficeHoliday[],
  filters: OfficeHolidayFilterState,
): OfficeHoliday[] {
  const query = filters.query.trim().toLowerCase()
  return [...holidays]
    .filter((item) => {
      if (filters.type !== 'all' && item.type !== filters.type) return false
      if (!query) return true
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.date.includes(query)
      )
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}