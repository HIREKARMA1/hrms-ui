/**
 * Day agenda card for the schedule tab (selected day details).
 */

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { OfficeCalendarScheduleItem } from '../../utils/officeCalendarScheduleItems'
import { officeCalendarOverviewDayMonth } from '../../utils/officeCalendarOverviewDateParts'
import { OfficeCalendarScheduleAgendaItem } from './OfficeCalendarScheduleAgendaItem'
import { SCHEDULE_AGENDA_HEADER, SCHEDULE_CARD, SCHEDULE_MOTION } from './officeCalendarScheduleUi'

type OfficeCalendarScheduleAgendaCardProps = {
  selectedDateKey: string
  agendaTitle: string
  dayItems: OfficeCalendarScheduleItem[]
  canManageEvents?: boolean
  onCreateEvent?: () => void
  onOpenEvent?: (id: string) => void
}

export function OfficeCalendarScheduleAgendaCard({
  selectedDateKey,
  agendaTitle,
  dayItems,
  canManageEvents,
  onCreateEvent,
  onOpenEvent,
}: OfficeCalendarScheduleAgendaCardProps) {
  const { day, month } = officeCalendarOverviewDayMonth(selectedDateKey)

  return (
    <section className={SCHEDULE_CARD} aria-labelledby="schedule-day-agenda">
      <div className={`${SCHEDULE_AGENDA_HEADER} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <h2 id="schedule-day-agenda" className="sr-only">
          Day agenda
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex h-[62px] w-[58px] flex-col items-center justify-center rounded-[14px] bg-hrms-primary text-white">
            <span className="text-2xl font-bold leading-none">{day}</span>
            <span className="text-xs font-semibold text-brand-100">{month}</span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Day agenda</p>
            <p className="text-[17px] font-bold text-hrms-navy">{agendaTitle}</p>
            <p className="text-xs text-gray-500">Click an event for details</p>
          </div>
        </div>
        {canManageEvents && onCreateEvent ? (
          <Button
            type="button"
            size="sm"
            className={`gap-1 bg-hrms-primary text-white hover:bg-hrms-primary-hover ${SCHEDULE_MOTION}`}
            onClick={onCreateEvent}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add event
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 p-4">
        {dayItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
            Nothing scheduled on this day.
          </p>
        ) : (
          dayItems.map((item) => (
            <OfficeCalendarScheduleAgendaItem key={item.id} item={item} onOpen={onOpenEvent} />
          ))
        )}
      </div>
    </section>
  )
}