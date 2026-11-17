/**
 * Leads data access layer (mock). Swap for API later.
 */

import { LEAD_ASSIGNEES } from '../constants/leadOptions'
import type {
  Lead,
  LeadActivity,
  LeadAttachment,
  LeadInput,
  LeadNote,
} from '../types/lead'
import { findLeadDuplicates } from '../utils/duplicateLeads'
import { generateLeadId } from '../utils/generateLeadId'
import { leadsMockStore } from './leadsMockStore'

const DELAY_MS = 120

function delay() {
  return new Promise((resolve) => window.setTimeout(resolve, DELAY_MS))
}

function isoNow() {
  return new Date().toISOString()
}

function authorName() {
  return 'HR Admin'
}

function pushActivity(lead: Lead, type: LeadActivity['type'], summary: string) {
  lead.activities.unshift({
    id: `LA-${Date.now()}-${lead.activities.length}`,
    type,
    summary,
    createdAt: isoNow(),
    createdBy: authorName(),
  })
}

function resolveAssignee(id: string | null) {
  if (!id) return { assignedEmployeeId: null, assignedEmployeeName: null }
  const match = LEAD_ASSIGNEES.find((item) => item.id === id)
  return {
    assignedEmployeeId: id,
    assignedEmployeeName: match?.name ?? null,
  }
}

export async function fetchLeads(): Promise<Lead[]> {
  await delay()
  return structuredClone(leadsMockStore)
}

export async function getLead(id: string): Promise<Lead | null> {
  await delay()
  const lead = leadsMockStore.find((item) => item.id === id)
  return lead ? structuredClone(lead) : null
}

export async function createLead(input: LeadInput): Promise<Lead> {
  await delay()
  const assignee = resolveAssignee(input.assignedEmployeeId)
  const id = generateLeadId(leadsMockStore)
  const stamp = isoNow()
  const lead: Lead = {
    ...input,
    ...assignee,
    id,
    notes: [],
    activities: [],
    attachments: [],
    createdAt: stamp,
    updatedAt: stamp,
  }
  pushActivity(lead, 'created', `Lead ${id} created`)
  leadsMockStore.unshift(structuredClone(lead))
  return structuredClone(lead)
}

export async function updateLead(id: string, input: LeadInput): Promise<Lead> {
  await delay()
  const index = leadsMockStore.findIndex((item) => item.id === id)
  if (index < 0) throw new Error('Lead not found')
  const prev = leadsMockStore[index]
  const assignee = resolveAssignee(input.assignedEmployeeId)
  const next: Lead = {
    ...prev,
    ...input,
    ...assignee,
    id,
    updatedAt: isoNow(),
  }
  if (prev.status !== next.status) {
    pushActivity(next, 'status', `Status changed to ${next.status}`)
  }
  if (prev.assignedEmployeeId !== next.assignedEmployeeId) {
    pushActivity(
      next,
      'assignment',
      next.assignedEmployeeName
        ? `Assigned to ${next.assignedEmployeeName}`
        : 'Assignment cleared',
    )
  }
  pushActivity(next, 'updated', 'Lead details updated')
  leadsMockStore[index] = structuredClone(next)
  return structuredClone(next)
}

export async function deleteLead(id: string): Promise<void> {
  await delay()
  const index = leadsMockStore.findIndex((item) => item.id === id)
  if (index >= 0) {
    leadsMockStore.splice(index, 1)
  }
}

export async function addLeadNote(leadId: string, text: string): Promise<Lead> {
  await delay()
  const index = leadsMockStore.findIndex((item) => item.id === leadId)
  if (index < 0) throw new Error('Lead not found')
  const lead = structuredClone(leadsMockStore[index])
  const note: LeadNote = {
    id: `LN-${Date.now()}`,
    text: text.trim(),
    authorName: authorName(),
    createdAt: isoNow(),
  }
  lead.notes.unshift(note)
  pushActivity(lead, 'note', 'Note added')
  lead.updatedAt = isoNow()
  leadsMockStore[index] = lead
  return structuredClone(lead)
}

export async function addLeadAttachment(leadId: string, fileName: string): Promise<Lead> {
  await delay()
  const index = leadsMockStore.findIndex((item) => item.id === leadId)
  if (index < 0) throw new Error('Lead not found')
  const lead = structuredClone(leadsMockStore[index])
  const file: LeadAttachment = {
    id: `LAT-${Date.now()}`,
    fileName,
    uploadedAt: isoNow(),
    uploadedBy: authorName(),
  }
  lead.attachments.unshift(file)
  pushActivity(lead, 'attachment', `Attachment uploaded: ${fileName}`)
  lead.updatedAt = isoNow()
  leadsMockStore[index] = lead
  return structuredClone(lead)
}

export async function checkLeadDuplicates(
  input: Pick<Lead, 'email' | 'phone' | 'companyName'>,
  excludeId?: string,
) {
  await delay()
  return findLeadDuplicates(leadsMockStore, input, excludeId)
}

export function summarizeLeads(leads: Lead[]) {
  const byStatus = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1
    return acc
  }, {})
  const highPriority = leads.filter((item) => item.priority === 'High').length
  const unassigned = leads.filter((item) => !item.assignedEmployeeId).length
  return { total: leads.length, byStatus, highPriority, unassigned }
}