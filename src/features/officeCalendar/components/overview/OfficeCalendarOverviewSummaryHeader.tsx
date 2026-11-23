/**
 * Action buttons for Office Calendar Overview summary card (no title band).
 */

import { CalendarDays, Palmtree, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { isHrAdminExperience, type UserRole } from '@/features/leave/constants/userRoles'

import type { OfficeCalendarPageTabId } from '../../hooks/useOfficeCalendarPageTabs'
import { OVERVIEW_MOTION, OVERVIEW_SUMMARY_HEADER } from './officeCalendarOverviewUi'

type OfficeCalendarOverviewSummaryHeaderProps = {
  role: UserRole
  holidayTab: OfficeCalendarPageTabId
  onNavigate: (tab: OfficeCalendarPageTabId) => void
  canCreateEvents?: boolean
  onScheduleEvent?: () => void
}

export function OfficeCalendarOverviewSummaryHeader({
  role,
  holidayTab,
  onNavigate,
  canCreateEvents,
  onScheduleEvent,
}: OfficeCalendarOverviewSummaryHeaderProps) {
  const showManage = isHrAdminExperience(role)
  const holidayLabel = showManage ? 'Manage holidays' : 'View holidays'

  return (
    <div className={`${OVERVIEW_SUMMARY_HEADER} flex flex-wrap items-center justify-end gap-2`}>
      <Button
        type="button"
        size="sm"
        className={cnPrimary(OVERVIEW_MOTION)}
        onClick={() => onNavigate('Calendar')}
      >
        <CalendarDays className="h-4 w-4" aria-hidden />
        Open calendar
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={`gap-1.5 border-hrms-lavender-border bg-hrms-lavender text-hrms-primary hover:bg-hrms-lavender/90 ${OVERVIEW_MOTION}`}
        onClick={() => onNavigate(holidayTab)}
      >
        <Palmtree className="h-4 w-4" aria-hidden />
        {holidayLabel}
      </Button>
      {canCreateEvents && onScheduleEvent ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={`gap-1.5 border-hrms-border bg-white text-hrms-navy ${OVERVIEW_MOTION}`}
          onClick={onScheduleEvent}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Schedule event
        </Button>
      ) : null}
    </div>
  )
}

function cnPrimary(motion: string) {
  return `gap-1.5 bg-hrms-primary text-white hover:bg-hrms-primary-hover ${motion}`
}