/**
 * Single-company leave settings and holiday seeds for the mock store.
 * Change samples here or via Leave Settings tab (persisted in memory).
 */

import type { LeaveSettings } from '../types/leaveSettings'
import { defaultLeaveTypes } from './defaultLeaveTypes'
import { leaveToday } from '../utils/leaveToday'

function sampleHolidays(year: number) {
  return [
    { id: `HOL-${year}-01`, date: `${year}-01-26`, name: 'Republic Day', holidayType: 'Public' as const },
    { id: `HOL-${year}-08`, date: `${year}-08-15`, name: 'Independence Day', holidayType: 'Public' as const },
    { id: `HOL-${year}-10`, date: `${year}-10-02`, name: 'Gandhi Jayanti', holidayType: 'Public' as const },
    { id: `HOL-${year}-11`, date: `${year}-11-12`, name: 'Diwali', holidayType: 'Company' as const },
    { id: `HOL-${year}-12`, date: `${year}-12-25`, name: 'Christmas', holidayType: 'Public' as const },
  ]
}

export function createDefaultLeaveSettings(): LeaveSettings {
  const year = leaveToday().getFullYear()
  return {
    leaveYearMode: 'jan_dec',
    weeklyOffDays: [0],
    sandwichRule: 'exclude',
    minProbationMonths: 0,
    leaveTypes: defaultLeaveTypes.map((item) => ({ ...item })),
    encashmentRules: { minimumBalanceDays: 10, maximumDaysPerYear: 15 },
    teamCoverage: { maxSameDepartmentPerDay: 2, mode: 'warn' },
    escalation: { daysPendingBeforeEscalation: 3 },
    holidays: sampleHolidays(year),
  }
}
