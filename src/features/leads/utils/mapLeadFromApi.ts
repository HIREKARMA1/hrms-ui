/**
 * Maps backend lead payloads to the existing Leads UI model.
 */

import type {
  BackendLead,
  BackendLeadEmployeeBrief,
  BackendLeadPriority,
  BackendLeadStatus,
  CreateLeadBody,
  UpdateLeadBody,
} from '../api/leadsApi.types'
import type { Lead, LeadInput, LeadPriority, LeadStatus } from '../types/lead'

const STATUS_TO_UI: Record<BackendLeadStatus, LeadStatus> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
}

const STATUS_TO_API: Record<LeadStatus, BackendLeadStatus> = {
  New: 'NEW',
  Contacted: 'CONTACTED',
  Qualified: 'QUALIFIED',
  Proposal: 'PROPOSAL',
  Negotiation: 'NEGOTIATION',
  Won: 'WON',
  Lost: 'LOST',
}

const PRIORITY_TO_UI: Record<BackendLeadPriority, LeadPriority> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

const PRIORITY_TO_API: Record<LeadPriority, BackendLeadPriority> = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
}

export function leadStatusToApi(status: LeadStatus): BackendLeadStatus {
  return STATUS_TO_API[status]
}

export function leadPriorityToApi(priority: LeadPriority): BackendLeadPriority {
  return PRIORITY_TO_API[priority]
}

export function leadStatusFromApi(status: BackendLeadStatus): LeadStatus {
  return STATUS_TO_UI[status] ?? 'New'
}

export function leadPriorityFromApi(priority: BackendLeadPriority): LeadPriority {
  return PRIORITY_TO_UI[priority] ?? 'Medium'
}

function employeeDisplayName(employee: BackendLeadEmployeeBrief | null): string | null {
  if (!employee) return null
  const name = `${employee.firstName} ${employee.lastName}`.trim()
  return name || employee.employeeCode || employee.id
}

export function mapBackendLeadToUi(row: BackendLead): Lead {
  return {
    id: row.id,
    leadName: row.fullName,
    companyName: row.companyName ?? '',
    contactPerson: row.fullName,
    email: row.email,
    phone: row.phone,
    website: '',
    industry: '',
    companySize: '',
    source: row.source.name,
    sourceId: row.source.id,
    category: row.category?.name ?? '',
    categoryId: row.category?.id ?? null,
    priority: leadPriorityFromApi(row.priority),
    status: leadStatusFromApi(row.status),
    estimatedValue: row.estimatedValue,
    attachmentUrl: row.attachmentUrl,
    assignedEmployeeId: row.assignedEmployee?.id ?? null,
    // Owner column: assigned employee profile name, else creator profile / email.
    assignedEmployeeName:
      employeeDisplayName(row.assignedEmployee) ??
      employeeDisplayName(row.createdByEmployee ?? null) ??
      row.createdByUser?.email ??
      null,
    assignedByEmployeeId: row.assignedByEmployee?.id ?? null,
    assignedByEmployeeName:
      employeeDisplayName(row.assignedByEmployee ?? null) ??
      row.assignedByUser?.email ??
      null,
    createdByEmployeeId: row.createdByEmployee?.id ?? null,
    createdByEmployeeName:
      employeeDisplayName(row.createdByEmployee ?? null) ??
      row.createdByUser?.email ??
      null,
    description: '',
    requirements: '',
    notes: (row.notes ?? []).map((note) => ({
      id: note.id,
      text: note.body,
      authorName: note.createdByUser.email,
      createdAt:
        typeof note.createdAt === 'string' ? note.createdAt : new Date(note.createdAt).toISOString(),
    })),
    activities: [],
    attachments: row.attachmentUrl
      ? [
          {
            id: `${row.id}-attachment`,
            fileName: row.attachmentUrl,
            uploadedAt:
              typeof row.updatedAt === 'string'
                ? row.updatedAt
                : new Date(row.updatedAt).toISOString(),
            uploadedBy: row.createdByUser.email,
          },
        ]
      : [],
    createdAt:
      typeof row.createdAt === 'string' ? row.createdAt : new Date(row.createdAt).toISOString(),
    updatedAt:
      typeof row.updatedAt === 'string' ? row.updatedAt : new Date(row.updatedAt).toISOString(),
  }
}

export function buildCreateLeadBody(input: LeadInput): CreateLeadBody {
  const body: CreateLeadBody = {
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    sourceId: (input.sourceId ?? '').trim(),
    priority: leadPriorityToApi(input.priority),
  }
  const fullName = input.leadName.trim()
  if (fullName) body.fullName = fullName
  const company = input.companyName.trim()
  if (company) body.companyName = company
  if (input.categoryId?.trim()) body.categoryId = input.categoryId.trim()
  if (input.estimatedValue?.trim()) {
    const value = Number.parseInt(input.estimatedValue.replace(/\D/g, ''), 10)
    if (Number.isFinite(value) && value >= 0) body.estimatedValue = value
  }
  if (input.attachmentUrl?.trim()) body.attachmentUrl = input.attachmentUrl.trim()
  const remarks = input.description.trim()
  if (remarks) body.remarks = remarks
  return body
}

export function buildUpdateLeadBody(input: LeadInput): UpdateLeadBody {
  const body: UpdateLeadBody = {
    fullName: input.leadName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    companyName: input.companyName.trim() || null,
    sourceId: (input.sourceId ?? '').trim() || undefined,
    categoryId: input.categoryId?.trim() ? input.categoryId.trim() : null,
    attachmentUrl: input.attachmentUrl?.trim() ? input.attachmentUrl.trim() : null,
  }
  if (input.estimatedValue?.trim()) {
    const value = Number.parseInt(input.estimatedValue.replace(/\D/g, ''), 10)
    if (Number.isFinite(value) && value >= 0) body.estimatedValue = value
    else body.estimatedValue = null
  } else {
    body.estimatedValue = null
  }
  return body
}
