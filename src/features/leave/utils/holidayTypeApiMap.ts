import type { OfficeHolidayType } from '@/features/officeCalendar/types/officeCalendar'

/**
 * Holiday `type` on POST/PATCH /holidays and in list/detail responses.
 * Legacy responses may still use PUBLIC.
 */
export type ApiHolidayType =
  | 'PUBLIC'
  | 'OPTIONAL'
  | 'COMPANY'
  | 'NATIONAL'
  | 'STATE'
  | 'REGIONAL'
  | 'FESTIVAL'

const UI_TO_API: Record<OfficeHolidayType, ApiHolidayType> = {
  National: 'NATIONAL',
  State: 'STATE',
  Regional: 'REGIONAL',
  Festival: 'FESTIVAL',
  Company: 'COMPANY',
  Optional: 'OPTIONAL',
}

const API_TO_UI: Record<Exclude<ApiHolidayType, 'PUBLIC'>, OfficeHolidayType> = {
  NATIONAL: 'National',
  STATE: 'State',
  REGIONAL: 'Regional',
  FESTIVAL: 'Festival',
  COMPANY: 'Company',
  OPTIONAL: 'Optional',
}

export function mapOfficeHolidayTypeToApi(type: OfficeHolidayType): ApiHolidayType {
  return UI_TO_API[type] ?? 'NATIONAL'
}

export function mapApiHolidayTypeToOffice(raw?: string): OfficeHolidayType {
  if (!raw) return 'Company'
  const normalized = raw.trim().toUpperCase()
  if (normalized === 'PUBLIC') return 'National'
  if (normalized in API_TO_UI) {
    return API_TO_UI[normalized as Exclude<ApiHolidayType, 'PUBLIC'>]
  }
  const title = raw.trim()
  const fromUi = (Object.keys(UI_TO_API) as OfficeHolidayType[]).find(
    (item) => item.toLowerCase() === title.toLowerCase(),
  )
  return fromUi ?? 'Company'
}