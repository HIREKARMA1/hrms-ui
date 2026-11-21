import type { OfficeHoliday } from '@/features/officeCalendar/types/officeCalendar'

import type { ApiHolidayItem } from '../types/api/holidaysList.types'
import { mapApiHolidayTypeToOffice } from './holidayTypeApiMap'

/** Maps GET /holidays list or GET /holidays/{id} DTO → office calendar holiday. */
export function mapApiHolidayToOfficeHoliday(item: ApiHolidayItem): OfficeHoliday {
  const date = (item.date ?? item.holidayDate ?? '').slice(0, 10)
  return {
    id: item.id,
    name: (item.name ?? item.title ?? 'Holiday').trim(),
    date,
    type: mapApiHolidayTypeToOffice(item.type ?? item.holidayType ?? item.category),
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