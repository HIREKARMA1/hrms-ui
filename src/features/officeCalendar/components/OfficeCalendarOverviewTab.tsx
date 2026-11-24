import type { UserRole } from '@/features/leave/constants/userRoles'

import { isHrAdminExperience, isManagerExperience } from '@/features/leave/constants/userRoles'



import type {
  OfficeCalendarEventListSource,
  OfficeHolidayListSource,
} from '../context/officeCalendarContext'
import type { OfficeCalendarPageTabId } from '../hooks/useOfficeCalendarPageTabs'
import { useOfficeCalendarOverviewData } from '../hooks/useOfficeCalendarOverviewData'
import { useOfficeCalendarOverviewInsights } from '../hooks/useOfficeCalendarOverviewInsights'
import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'

import { OfficeCalendarMockBanner } from './OfficeCalendarMockBanner'

import { OfficeCalendarOverviewHolidaysCard } from './overview/OfficeCalendarOverviewHolidaysCard'

import { OfficeCalendarOverviewSummaryCard } from './overview/OfficeCalendarOverviewSummaryCard'

import { OfficeCalendarOverviewTodayCard } from './overview/OfficeCalendarOverviewTodayCard'

import { OfficeCalendarOverviewUpcomingEventsCard } from './overview/OfficeCalendarOverviewUpcomingEventsCard'



type OfficeCalendarOverviewTabProps = {

  role: UserRole

  holidays: OfficeHoliday[]

  events: OfficeCalendarEvent[]

  onNavigate: (tab: OfficeCalendarPageTabId) => void

  canCreateEvents?: boolean

  onScheduleEvent?: () => void

  onOpenEvent?: (eventId: string) => void

  eventsSource?: OfficeCalendarEventListSource

  holidaysSource?: OfficeHolidayListSource

}



/** Office Calendar Overview tab content (/manager/calendar and role variants). */

export function OfficeCalendarOverviewTab({

  role,

  holidays,

  events,

  onNavigate,

  canCreateEvents,

  onScheduleEvent,

  onOpenEvent,

  eventsSource = 'demo',

  holidaysSource = 'demo',

}: OfficeCalendarOverviewTabProps) {

  const holidayNavTab: OfficeCalendarPageTabId = isManagerExperience(role)

    ? 'Holidays'

    : 'Holiday Management'



  const insights = useOfficeCalendarOverviewInsights(eventsSource)

  const data = useOfficeCalendarOverviewData(holidays, events, {
    todayEvents: insights.todayEvents,
    upcomingEvents: insights.upcomingEvents,
  })



  return (

    <div className="flex flex-col gap-5 font-[family-name:var(--font-inter)]">

      {isHrAdminExperience(role) ? (
        <OfficeCalendarMockBanner eventsSource={eventsSource} holidaysSource={holidaysSource} />
      ) : null}

      <OfficeCalendarOverviewSummaryCard

        role={role}

        holidays={holidays}

        events={events}

        holidayTab={holidayNavTab}

        onNavigate={onNavigate}

        canCreateEvents={canCreateEvents}

        onScheduleEvent={onScheduleEvent}

      />



      <OfficeCalendarOverviewTodayCard

        todayKey={data.todayKey}

        todayHolidays={data.todayHolidays}

        todayEvents={data.todayEvents}

        onOpenEvent={onOpenEvent}

      />



      <div className="grid items-start gap-4 min-[1100px]:grid-cols-[3fr_2fr]">

        <OfficeCalendarOverviewUpcomingEventsCard

          subtitle={`${data.thisWeekCount} in the next 7 days`}

          todayKey={data.todayKey}

          items={data.upcomingEvents}

          emptyLabel="No upcoming events."

          onViewAll={() => onNavigate('Calendar')}

          onOpenEvent={onOpenEvent}

        />

        <OfficeCalendarOverviewHolidaysCard

          subtitle={`${data.upcomingHolidays.length} upcoming · mandatory and optional`}

          items={data.upcomingHolidays}

          emptyLabel="No upcoming holidays in the list."

          onViewAll={() => onNavigate(holidayNavTab)}

        />

      </div>

    </div>

  )

}
