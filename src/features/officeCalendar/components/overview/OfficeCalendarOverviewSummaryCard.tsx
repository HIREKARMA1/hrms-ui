/**
 * Top summary card on Office Calendar Overview (header + stat tiles).
 */

import { CalendarDays, Palmtree, PartyPopper, Video } from 'lucide-react'

import type { UserRole } from '@/features/leave/constants/userRoles'

import type { OfficeCalendarPageTabId } from '../../hooks/useOfficeCalendarPageTabs'
import type { OfficeCalendarEvent, OfficeHoliday } from '../../types/officeCalendar'
import { OfficeCalendarOverviewStatTile } from './OfficeCalendarOverviewStatTile'
import { OfficeCalendarOverviewSummaryHeader } from './OfficeCalendarOverviewSummaryHeader'
import { OVERVIEW_CARD } from './officeCalendarOverviewUi'

type OfficeCalendarOverviewSummaryCardProps = {
  role: UserRole
  holidays: OfficeHoliday[]
  events: OfficeCalendarEvent[]
  holidayTab: OfficeCalendarPageTabId
  onNavigate: (tab: OfficeCalendarPageTabId) => void
  onScheduleEvent?: () => void
}

export function OfficeCalendarOverviewSummaryCard({
  role,
  holidays,
  events,
  holidayTab,
  onNavigate,
  onScheduleEvent,
}: OfficeCalendarOverviewSummaryCardProps) {
  const meetings = events.filter((item) => item.type === 'meeting').length
  const trainings = events.filter((item) => item.type === 'training').length

  return (
    <section className={OVERVIEW_CARD} aria-label="Overview summary">
      <OfficeCalendarOverviewSummaryHeader
        role={role}
        holidayTab={holidayTab}
        onNavigate={onNavigate}
        onScheduleEvent={onScheduleEvent}
      />
      <div className="grid grid-cols-2 gap-3 p-5 min-[1100px]:grid-cols-4">
        <OfficeCalendarOverviewStatTile
          label="Holidays"
          value={holidays.length}
          icon={Palmtree}
          tone="warning"
          onClick={() => onNavigate(holidayTab)}
        />
        <OfficeCalendarOverviewStatTile
          label="Events"
          value={events.length}
          icon={CalendarDays}
          tone="info"
          onClick={() => onNavigate('Calendar')}
        />
        <OfficeCalendarOverviewStatTile
          label="Meetings"
          value={meetings}
          icon={Video}
          tone="primary"
          onClick={() => onNavigate('Calendar')}
        />
        <OfficeCalendarOverviewStatTile
          label="Training"
          value={trainings}
          icon={PartyPopper}
          tone="success"
          onClick={() => onNavigate('Calendar')}
        />
      </div>
    </section>
  )
}