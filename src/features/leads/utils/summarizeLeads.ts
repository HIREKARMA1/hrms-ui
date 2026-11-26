import type { Lead } from '../types/lead'

export function summarizeLeads(leads: Lead[]) {
  const byStatus = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1
    return acc
  }, {})
  const highPriority = leads.filter((item) => item.priority === 'High').length
  const unassigned = leads.filter((item) => !item.assignedEmployeeId).length
  return { total: leads.length, byStatus, highPriority, unassigned }
}
