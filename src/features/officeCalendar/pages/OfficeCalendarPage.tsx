import { useMemo } from 'react'

import type { UserRole } from '@/features/leave/constants/userRoles'
import { AccessDeniedPage } from '@/features/rbac/components/AccessDeniedPage'
import { useFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { useRbacSession } from '@/features/rbac/hooks/useRbacSession'

import { OfficeCalendarEventDialogHost } from '../components/OfficeCalendarEventDialogHost'
import { OfficeCalendarPageHeader } from '../components/OfficeCalendarPageHeader'
import { OfficeCalendarPageSkeleton } from '../components/OfficeCalendarPageSkeleton'
import { OfficeCalendarTabSection } from '../components/OfficeCalendarTabSection'
import { OfficeCalendarProvider } from '../context/OfficeCalendarProvider'
import { OfficeCalendarConfirmProvider } from '../context/OfficeCalendarConfirmProvider'
import { OfficeCalendarToastProvider } from '../context/OfficeCalendarToastProvider'
import { useOfficeCalendar } from '../hooks/useOfficeCalendar'
import { useOfficeCalendarEventDialogs } from '../hooks/useOfficeCalendarEventDialogs'
import { useOfficeCalendarRoute } from '../hooks/useOfficeCalendarRoute'
import { useOfficeCalendarScope } from '../hooks/useOfficeCalendarScope'
import { useCalendarEventPermissions } from '@/features/rbac/hooks/useCalendarEventPermissions'
import { isOfficeCalendarHolidayTab } from '../utils/officeCalendarTabFeatures'
import { visibleEventsForRole } from '../utils/visibleCalendarForRole'

function OfficeCalendarPanels() {
  const session = useRbacSession()
  const role = (session.roleCode ?? 'HR_ADMIN') as UserRole
  const { activeTab, goToTab } = useOfficeCalendarRoute(role)
  const {
    loading,
    error,
    reload,
    events,
    holidays,
    saveHoliday,
    removeHoliday,
    eventsSource,
    holidaysSource,
    setEventYear,
    eventSearchQuery,
    setEventSearchQuery,
    eventSearchFetching,
  } = useOfficeCalendar()
  const scope = useOfficeCalendarScope(role)
  const calendarEventPerms = useCalendarEventPermissions()
  const canCreateEvents =
    scope.canManageEvents && (eventsSource === 'demo' || calendarEventPerms.canCreate)
  const canEditEvents =
    scope.canManageEvents && (eventsSource === 'demo' || calendarEventPerms.canUpdate)
  const canDeleteEvents =
    scope.canManageEvents && (eventsSource === 'demo' || calendarEventPerms.canDelete)
  const visibleEvents = useMemo(() => visibleEventsForRole(events, role), [events, role])
  const dialogs = useOfficeCalendarEventDialogs(visibleEvents)
  const { canAccess } = useFeatureAccess()

  // Same rule as the sidebar child: Holidays needs `calendar.holidays`.
  if (isOfficeCalendarHolidayTab(activeTab) && !canAccess('calendar.holidays')) {
    return <AccessDeniedPage featureLabel="Office Calendar Holidays" />
  }

  if (loading) {
    return <OfficeCalendarPageSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-xl border border-hrms-danger/30 bg-red-50 p-4 text-sm text-hrms-danger">
        {error}{' '}
        <button type="button" className="underline" onClick={reload}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header className="border-b border-hrms-border pb-3 pt-1">
        <OfficeCalendarPageHeader activeSection={activeTab} />
      </header>

      <OfficeCalendarTabSection
        activeTab={activeTab}
        role={role}
        holidays={holidays}
        visibleEvents={visibleEvents}
        canViewOverview={scope.canViewOverview}
        isReadOnlyHolidays={scope.isReadOnlyHolidays}
        canCreateEvents={canCreateEvents}
        goToTab={goToTab}
        onCreateEvent={dialogs.openCreateEvent}
        onOpenEvent={dialogs.setDetailEventId}
        onSaveHoliday={saveHoliday}
        onDeleteHoliday={removeHoliday}
        eventsSource={eventsSource}
        holidaysSource={holidaysSource}
        onVisibleEventYearChange={setEventYear}
        eventSearchQuery={eventSearchQuery}
        onEventSearchQueryChange={setEventSearchQuery}
        eventSearchFetching={eventSearchFetching}
      />

      <OfficeCalendarEventDialogHost
        eventForm={dialogs.eventForm}
        setEventFormOpen={(open) => dialogs.setEventForm((state) => ({ ...state, open }))}
        detailEvent={dialogs.detailEvent}
        detailOpen={Boolean(dialogs.detailEvent)}
        onDetailOpenChange={(open) => {
          if (!open) dialogs.setDetailEventId(null)
        }}
        canEditEvents={canEditEvents}
        canDeleteEvents={canDeleteEvents}
        onEditDetail={() => {
          if (dialogs.detailEvent) dialogs.openEditEvent(dialogs.detailEvent)
        }}
        onDetailDeleted={() => dialogs.setDetailEventId(null)}
      />
    </div>
  )
}

export function OfficeCalendarPage() {
  return (
    <OfficeCalendarProvider>
      <OfficeCalendarToastProvider>
        <OfficeCalendarConfirmProvider>
          <OfficeCalendarPanels />
        </OfficeCalendarConfirmProvider>
      </OfficeCalendarToastProvider>
    </OfficeCalendarProvider>
  )
}

export default OfficeCalendarPage