import type { UserRole } from '@/features/leave/constants/userRoles'

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
  canManageEvents: boolean
  goToTab: (tab: OfficeCalendarPageTabId) => void
  onCreateEvent: (date?: string) => void
  onOpenEvent: (id: string) => void
  onSaveHoliday: (input: OfficeHolidayInput, id?: string) => Promise<OfficeHoliday>
  onDeleteHoliday: (id: string) => Promise<void>
}

export function OfficeCalendarTabSection({
  activeTab,
  role,
  holidays,
  visibleEvents,
  canViewOverview,
  isReadOnlyHolidays,
  canManageEvents,
  goToTab,
  onCreateEvent,
  onOpenEvent,
  onSaveHoliday,
  onDeleteHoliday,
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
          canManageEvents={canManageEvents}
          onScheduleEvent={() => onCreateEvent()}
          onOpenEvent={onOpenEvent}
        />
      ) : null}
      {activeTab === 'Calendar' ? (
        <OfficeCalendarScheduleTab
          holidays={holidays}
          events={visibleEvents}
          canManageEvents={canManageEvents}
          onCreateEvent={onCreateEvent}
          onOpenEvent={onOpenEvent}
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