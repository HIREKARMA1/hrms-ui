import type { UserRole } from '@/features/leave/constants/userRoles'

import type {
  OfficeCalendarEventListSource,
  OfficeHolidayListSource,
} from '../context/officeCalendarContext'
import type { OfficeCalendarPageTabId } from '../hooks/useOfficeCalendarPageTabs'
import type { OfficeCalendarEvent, OfficeHoliday, OfficeHolidayInput } from '../types/officeCalendar'
import { OfficeCalendarHolidaysTab } from './OfficeCalendarHolidaysTab'
import { OfficeCalendarOverviewTab } from './OfficeCalendarOverviewTab'
import { OfficeCalendarScheduleTab } from './OfficeCalendarScheduleTab'

type OfficeCalendarTabSectionProps = {
  activeTab: OfficeCalendarPageTabId
  role: UserRole
  holidays: OfficeHoliday[]
  visibleEvents: OfficeCalendarEvent[]
  canViewOverview: boolean
  isReadOnlyHolidays: boolean
  canCreateEvents: boolean
  goToTab: (tab: OfficeCalendarPageTabId) => void
  onCreateEvent: (date?: string) => void
  onOpenEvent: (id: string) => void
  onSaveHoliday: (input: OfficeHolidayInput, id?: string) => Promise<OfficeHoliday>
  onDeleteHoliday: (id: string) => Promise<void>
  eventsSource: OfficeCalendarEventListSource
  holidaysSource: OfficeHolidayListSource
  onVisibleEventYearChange: (year: number) => void
  eventSearchQuery: string
  onEventSearchQueryChange: (query: string) => void
  eventSearchFetching: boolean
}

export function OfficeCalendarTabSection({
  activeTab,
  role,
  holidays,
  visibleEvents,
  canViewOverview,
  isReadOnlyHolidays,
  canCreateEvents,
  goToTab,
  onCreateEvent,
  onOpenEvent,
  onSaveHoliday,
  onDeleteHoliday,
  eventsSource,
  holidaysSource,
  onVisibleEventYearChange,
  eventSearchQuery,
  onEventSearchQueryChange,
  eventSearchFetching,
}: OfficeCalendarTabSectionProps) {
  const holidayTabActive = activeTab === 'Holidays' || activeTab === 'Holiday Management'

  return (
    <section aria-label={activeTab} className="min-h-0 w-full rounded-xl bg-transparent">
      {activeTab === 'Overview' && canViewOverview ? (
        <OfficeCalendarOverviewTab
          role={role}
          holidays={holidays}
          events={visibleEvents}
          onNavigate={goToTab}
          canCreateEvents={canCreateEvents}
          onScheduleEvent={() => onCreateEvent()}
          onOpenEvent={onOpenEvent}
          eventsSource={eventsSource}
          holidaysSource={holidaysSource}
        />
      ) : null}
      {activeTab === 'Calendar' ? (
        <OfficeCalendarScheduleTab
          holidays={holidays}
          events={visibleEvents}
          canCreateEvents={canCreateEvents}
          onCreateEvent={onCreateEvent}
          onOpenEvent={onOpenEvent}
          eventsSource={eventsSource}
          onVisibleYearChange={onVisibleEventYearChange}
          eventSearchQuery={eventSearchQuery}
          onEventSearchQueryChange={onEventSearchQueryChange}
          eventSearchFetching={eventSearchFetching}
        />
      ) : null}
      {holidayTabActive ? (
        <OfficeCalendarHolidaysTab
          role={role}
          holidays={holidays}
          readOnly={isReadOnlyHolidays}
          onSave={onSaveHoliday}
          onDelete={onDeleteHoliday}
        />
      ) : null}
    </section>
  )
}