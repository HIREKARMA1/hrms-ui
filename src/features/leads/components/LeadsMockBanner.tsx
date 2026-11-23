import { LEADS_INFO_BANNER } from './shared/leadsUi'

export function LeadsMockBanner() {
  return (
    <p className={LEADS_INFO_BANNER}>
      <span className="font-medium text-hrms-primary">Demo data</span>
      <span className="text-hrms-text-secondary"> — stored in this session until the CRM API is connected.</span>
    </p>
  )
}