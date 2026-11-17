import type { OfficeHoliday, OfficeHolidayInput, OfficeHolidayType } from '../types/officeCalendar'

export const OFFICE_HOLIDAY_TYPES: OfficeHolidayType[] = [
  'National',
  'State',
  'Regional',
  'Festival',
  'Company',
  'Optional',
]

export function emptyOfficeHolidayInput(): OfficeHolidayInput {
  return {
    name: '',
    date: '',
    type: 'Company',
    departmentId: null,
    branchId: null,
    mandatory: true,
    description: '',
  }
}

export function officeHolidayInputFromHoliday(item: OfficeHoliday): OfficeHolidayInput {
  return {
    name: item.name,
    date: item.date,
    type: item.type,
    state: item.state,
    departmentId: item.departmentId,
    branchId: item.branchId,
    mandatory: item.mandatory,
    description: item.description,
  }
}