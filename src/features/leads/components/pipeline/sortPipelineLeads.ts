import type { Lead, LeadStatus } from '../../types/lead'
import { ACTIVE_PIPELINE_STATUSES, CLOSED_PIPELINE_STATUSES } from './pipelineStages'

const STAGE_ORDER: LeadStatus[] = [...ACTIVE_PIPELINE_STATUSES, ...CLOSED_PIPELINE_STATUSES]

export function sortPipelineLeads(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const stageA = STAGE_ORDER.indexOf(a.status)
    const stageB = STAGE_ORDER.indexOf(b.status)
    if (stageA !== stageB) return stageA - stageB
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}