import type { Lead } from '../types/lead'
import { findLeadDuplicates } from './duplicateLeads'

export type LeadDuplicatePair = {
  leadA: Lead
  leadB: Lead
  reasons: string[]
}

export function collectLeadDuplicatePairs(leads: Lead[]): LeadDuplicatePair[] {
  const seen = new Set<string>()
  const results: LeadDuplicatePair[] = []

  for (const lead of leads) {
    const matches = findLeadDuplicates(leads, lead, lead.id)
    for (const match of matches) {
      const key = [lead.id, match.lead.id].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)
      const [idA, idB] = [lead.id, match.lead.id].sort()
      const leadA = leads.find((item) => item.id === idA)!
      const leadB = leads.find((item) => item.id === idB)!
      results.push({ leadA, leadB, reasons: match.reasons })
    }
  }

  return results.sort((a, b) => a.leadA.id.localeCompare(b.leadA.id))
}