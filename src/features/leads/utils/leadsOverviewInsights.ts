/**
 * Derived metrics for Leads Overview (mock-friendly, no API).
 */

import { LEAD_STATUSES } from '../constants/leadOptions'
import type { Lead, LeadActivity } from '../types/lead'
import { collectLeadDuplicatePairs } from './leadDuplicatePairs'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function buildLeadStatusFunnel(leads: Lead[]) {
  return LEAD_STATUSES.map((status) => ({
    status,
    count: leads.filter((item) => item.status === status).length,
  }))
}

export function buildLeadSourceBreakdown(leads: Lead[]) {
  const map = new Map<string, number>()
  leads.forEach((lead) => {
    map.set(lead.source, (map.get(lead.source) ?? 0) + 1)
  })
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export type LeadActivityRow = LeadActivity & {
  leadId: string
  leadName: string
  companyName: string
}

export function recentLeadActivities(leads: Lead[], limit = 8): LeadActivityRow[] {
  return leads
    .flatMap((lead) =>
      lead.activities.map((activity) => ({
        ...activity,
        leadId: lead.id,
        leadName: lead.leadName,
        companyName: lead.companyName,
      })),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}

export function leadsNeedingAttention(leads: Lead[]): Lead[] {
  const now = Date.now()
  return leads.filter((lead) => {
    if (lead.status === 'Won' || lead.status === 'Lost') return false
    if (!lead.assignedEmployeeId) return true
    if (lead.priority === 'High') {
      const updated = new Date(lead.updatedAt).getTime()
      if (Number.isFinite(updated) && now - updated > WEEK_MS) return true
    }
    return false
  })
}

export function countDuplicatePairs(leads: Lead[]): number {
  return collectLeadDuplicatePairs(leads).length
}