import type { LeadStatus } from '../types/lead'

/** Status dot and funnel bar colors (Leads Overview redesign). */
export const LEADS_OVERVIEW_STATUS_COLORS: Record<LeadStatus, string> = {
  New: '#3B82F6',
  Contacted: '#98A2B3',
  Qualified: '#7055EB',
  Proposal: '#5938DB',
  Negotiation: '#F59E0B',
  Won: '#16A34A',
  Lost: '#EF4444',
}

export const LEADS_OVERVIEW_ACTIVE_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
]

export function leadsOverviewStageChipBg(status: LeadStatus): string {
  const base = LEADS_OVERVIEW_STATUS_COLORS[status]
  return `${base}26`
}