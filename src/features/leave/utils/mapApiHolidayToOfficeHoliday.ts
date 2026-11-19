import type { OfficeHoliday, OfficeHolidayType } from '@/features/officeCalendar/types/officeCalendar'
import { OFFICE_HOLIDAY_TYPES } from '@/features/officeCalendar/utils/officeHolidayForm'

import type { ApiHolidayItem } from '../types/api/holidaysList.types'

function mapHolidayType(raw?: string): OfficeHolidayType {
  if (!raw) return 'Company'
  const match = OFFICE_HOLIDAY_TYPES.find(
    (type) => type.toLowerCase() === raw.toLowerCase(),
  )
  return match ?? 'Company'
}

/** Maps GET /holidays list or GET /holidays/{id} DTO → office calendar holiday. */
export function mapApiHolidayToOfficeHoliday(item: ApiHolidayItem): OfficeHoliday {
  const date = (item.date ?? item.holidayDate ?? '').slice(0, 10)
  return {
    id: item.id,
    name: (item.name ?? item.title ?? 'Holiday').trim(),
    date,
    type: mapHolidayType(item.type ?? item.holidayType),
    state: item.state,
    departmentId: item.departmentId ?? null,
    branchId: item.branchId ?? null,
    mandatory: item.mandatory ?? true,
    description: item.description?.trim() ?? '',
  }
}

export function mapApiHolidaysListToOfficeHolidays(
  items: ApiHolidayItem[],
): OfficeHoliday[] {
  return items
    .map(mapApiHolidayToOfficeHoliday)
    .filter((item) => item.id && item.date && item.name)
}