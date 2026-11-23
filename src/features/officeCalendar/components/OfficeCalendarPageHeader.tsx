import { CALENDAR_ACTIVE_SECTION_PILL } from './shared/officeCalendarUi'

type OfficeCalendarPageHeaderProps = {
  activeSection?: string
}

export function OfficeCalendarPageHeader({ activeSection }: OfficeCalendarPageHeaderProps) {
  const isOverview = activeSection === 'Overview'

  if (isOverview) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[28px] font-bold tracking-tight text-hrms-navy">Office Calendar</h1>
        <span className={CALENDAR_ACTIVE_SECTION_PILL}>Overview</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-hrms-navy">Office Calendar</h1>
        <p className="mt-1 text-sm text-hrms-text-secondary">
          Company holidays, events, and meetings in one schedule for every role.
        </p>
      </div>
      {activeSection ? <span className={CALENDAR_ACTIVE_SECTION_PILL}>{activeSection}</span> : null}
    </div>
  )
}