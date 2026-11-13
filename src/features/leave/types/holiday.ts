/**
 * Company holiday calendar entry for leave day counting and calendar tab.
 * Stored in LeaveSettings and read by countLeaveDays.
 */

export type HolidayType = 'Public' | 'Company'

export type Holiday = {
  id: string
  date: string
  name: string
  holidayType: HolidayType
}
