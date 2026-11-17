/**
 * Semantic type tones for Office Calendar Overview (Holiday / Event / Meeting / Training).
 * Used by stat tiles, event rows, and holiday rows on the Overview tab only.
 */

import type { OfficeEventType } from '../types/officeCalendar'

export type OfficeCalendarOverviewTone = 'warning' | 'info' | 'primary' | 'success'

export const OFFICE_CALENDAR_OVERVIEW_EVENT_TYPE_TONE: Record<OfficeEventType, OfficeCalendarOverviewTone> =
  {
    holiday: 'warning',
    event: 'info',
    meeting: 'primary',
    training: 'success',
  }

export const OFFICE_CALENDAR_OVERVIEW_TONE_STYLES: Record<
  OfficeCalendarOverviewTone,
  {
    iconTile: string
    icon: string
    bottomBar: string
    dateTile: string
    dateDay: string
    dateMonth: string
    typePill: string
    rowAccent: string
  }
> = {
  warning: {
    iconTile: 'bg-hrms-warning/12 text-hrms-warning',
    icon: 'text-hrms-warning',
    bottomBar: 'border-b-[3px] border-b-hrms-warning',
    dateTile: 'bg-hrms-warning/12 text-hrms-warning',
    dateDay: 'text-hrms-warning',
    dateMonth: 'text-hrms-warning/80',
    typePill: 'bg-hrms-warning/[0.13] text-hrms-warning',
    rowAccent: 'border-l-hrms-warning',
  },
  info: {
    iconTile: 'bg-hrms-info/12 text-hrms-info',
    icon: 'text-hrms-info',
    bottomBar: 'border-b-[3px] border-b-hrms-info',
    dateTile: 'bg-hrms-info/12 text-hrms-info',
    dateDay: 'text-hrms-info',
    dateMonth: 'text-hrms-info/80',
    typePill: 'bg-hrms-info/[0.13] text-hrms-info',
    rowAccent: 'border-l-hrms-info',
  },
  primary: {
    iconTile: 'bg-hrms-primary/12 text-hrms-primary',
    icon: 'text-hrms-primary',
    bottomBar: 'border-b-[3px] border-b-hrms-primary',
    dateTile: 'bg-hrms-primary/12 text-hrms-primary',
    dateDay: 'text-hrms-primary',
    dateMonth: 'text-hrms-primary/80',
    typePill: 'bg-hrms-primary/[0.13] text-hrms-primary',
    rowAccent: 'border-l-hrms-primary',
  },
  success: {
    iconTile: 'bg-hrms-success/12 text-hrms-success',
    icon: 'text-hrms-success',
    bottomBar: 'border-b-[3px] border-b-hrms-success',
    dateTile: 'bg-hrms-success/12 text-hrms-success',
    dateDay: 'text-hrms-success',
    dateMonth: 'text-hrms-success/80',
    typePill: 'bg-hrms-success/[0.13] text-hrms-success',
    rowAccent: 'border-l-hrms-success',
  },
}