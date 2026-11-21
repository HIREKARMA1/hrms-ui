import type { OfficeHolidayType } from '@/features/officeCalendar/types/officeCalendar'

/** Backend rejects notify for OPTIONAL holidays. */
export function isOfficeHolidayTypeNotifiable(type: OfficeHolidayType): boolean {
  return type !== 'Optional'
}

export const OFFICE_HOLIDAY_NOTIFY_INELIGIBLE_HINT =
  'Optional holidays cannot be emailed. Change type to National, State, Regional, Festival, or Company, then save.'