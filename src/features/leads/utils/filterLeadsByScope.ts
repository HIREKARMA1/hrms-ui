import { MANAGER_TEAM_ASSIGNEE_IDS, type LeadsListScope } from '../constants/leadsDemoActor'
import type { Lead } from '../types/lead'

export function filterLeadsByScope(
  leads: Lead[],
  scope: LeadsListScope,
  actorEmployeeId: string,
): Lead[] {
  if (scope === 'org') return leads
  if (scope === 'my') {
    return leads.filter((item) => item.assignedEmployeeId === actorEmployeeId)
  }
  return leads.filter(
    (item) =>
      item.assignedEmployeeId !== null &&
      MANAGER_TEAM_ASSIGNEE_IDS.includes(
        item.assignedEmployeeId as (typeof MANAGER_TEAM_ASSIGNEE_IDS)[number],
      ),
  )
}