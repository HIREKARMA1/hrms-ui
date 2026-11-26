import type { LeadsListScope } from '../constants/leadsDemoActor'
import type { Lead } from '../types/lead'

/**
 * Client-side scope filter. Prefer server `assignedEmployeeId` for "my" when
 * listing; team currently shows all readable leads (no team-roster API yet).
 */
export function filterLeadsByScope(
  leads: Lead[],
  scope: LeadsListScope,
  actorEmployeeId: string,
): Lead[] {
  if (scope === 'org' || scope === 'team') return leads
  if (!actorEmployeeId) return []
  return leads.filter((item) => item.assignedEmployeeId === actorEmployeeId)
}
