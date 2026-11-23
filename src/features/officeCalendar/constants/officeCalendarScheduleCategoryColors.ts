/**
 * Category colors for Office Calendar schedule tab (grid, agenda, upcoming).
 */

export type OfficeCalendarScheduleCategory =
  | 'holiday'
  | 'weeklyOff'
  | 'event'
  | 'meeting'
  | 'training'

export const OFFICE_CALENDAR_SCHEDULE_CATEGORIES: OfficeCalendarScheduleCategory[] = [
  'holiday',
  'weeklyOff',
  'event',
  'meeting',
  'training',
]

export const OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES: Record<
  OfficeCalendarScheduleCategory,
  { chipActive: string; chipDot: string; pill: string; bar: string; dateChip: string; dot: string }
> = {
  holiday: {
    chipActive: 'border-amber-500 bg-amber-50 text-amber-900',
    chipDot: 'bg-amber-500',
    pill: 'border-l-amber-500 bg-amber-50 text-amber-900',
    bar: 'border-l-[3px] border-l-amber-500',
    dateChip: 'bg-amber-50 text-amber-900',
    dot: 'bg-amber-500',
  },
  weeklyOff: {
    chipActive: 'border-slate-500 bg-slate-100 text-slate-900',
    chipDot: 'bg-slate-500',
    pill: 'border-l-slate-500 bg-slate-100 text-slate-800',
    bar: 'border-l-[3px] border-l-slate-500',
    dateChip: 'bg-slate-100 text-slate-800',
    dot: 'bg-slate-500',
  },
  event: {
    chipActive: 'border-blue-500 bg-blue-100 text-blue-900',
    chipDot: 'bg-blue-500',
    pill: 'border-l-blue-500 bg-blue-100 text-blue-900',
    bar: 'border-l-[3px] border-l-blue-500',
    dateChip: 'bg-blue-100 text-blue-900',
    dot: 'bg-blue-500',
  },
  meeting: {
    chipActive: 'border-violet-500 bg-violet-100 text-violet-900',
    chipDot: 'bg-violet-500',
    pill: 'border-l-violet-500 bg-violet-100 text-violet-900',
    bar: 'border-l-[3px] border-l-violet-500',
    dateChip: 'bg-violet-100 text-violet-900',
    dot: 'bg-violet-500',
  },
  training: {
    chipActive: 'border-green-600 bg-green-100 text-green-900',
    chipDot: 'bg-green-600',
    pill: 'border-l-green-600 bg-green-100 text-green-900',
    bar: 'border-l-[3px] border-l-green-600',
    dateChip: 'bg-green-100 text-green-900',
    dot: 'bg-green-600',
  },
}

export function eventTypeToScheduleCategory(
  type: 'holiday' | 'event' | 'meeting' | 'training',
): OfficeCalendarScheduleCategory {
  return type
}