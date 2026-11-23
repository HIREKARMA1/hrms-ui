import type { LeadStatus } from '../../types/lead'

export const ACTIVE_PIPELINE_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
]

export const CLOSED_PIPELINE_STATUSES: LeadStatus[] = ['Won', 'Lost']

export const PIPELINE_STAGE_HINTS: Record<LeadStatus, string> = {
  New: 'Captured, not yet worked',
  Contacted: 'Outreach started',
  Qualified: 'Fits your criteria',
  Proposal: 'Quote or proposal sent',
  Negotiation: 'Terms and pricing',
  Won: 'Closed — customer',
  Lost: 'Closed — no deal',
}