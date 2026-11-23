import { LEADS_ACTIVE_SECTION_PILL } from './shared/leadsUi'
import { LeadsOverviewDemoPill } from './overview/LeadsOverviewDemoPill'

type LeadsPageHeaderProps = {
  activeSection?: string
}

export function LeadsPageHeader({ activeSection }: LeadsPageHeaderProps) {
  const isOverview = activeSection === 'Overview'

  if (isOverview) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold tracking-tight text-[#17213A]">Leads Management</h1>
        <LeadsOverviewDemoPill />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-hrms-navy">Leads Management</h1>
        <p className="mt-1 text-sm text-hrms-text-secondary">
          Capture prospects, assign owners, and track status through conversion.
        </p>
      </div>
      {activeSection ? <p className={LEADS_ACTIVE_SECTION_PILL}>{activeSection}</p> : null}
    </div>
  )
}