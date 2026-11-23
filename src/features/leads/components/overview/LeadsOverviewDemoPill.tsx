import { OVERVIEW_DEMO_PILL } from './leadsOverviewUi'

export function LeadsOverviewDemoPill() {
  return (
    <p className={OVERVIEW_DEMO_PILL}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#3B82F6]" aria-hidden />
      <span>
        <span className="font-semibold">Demo data</span>
        <span className="font-normal"> — stored in this session until the CRM API is connected.</span>
      </span>
    </p>
  )
}