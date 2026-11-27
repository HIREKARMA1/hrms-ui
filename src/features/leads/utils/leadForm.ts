import type { Lead, LeadInput, LeadPriority, LeadStatus } from '../types/lead'

export function leadToInput(lead: Lead): LeadInput {
  return {
    leadName: lead.leadName,
    companyName: lead.companyName,
    contactPerson: lead.contactPerson,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    industry: lead.industry,
    companySize: lead.companySize,
    source: lead.source,
    sourceId: lead.sourceId,
    category: lead.category,
    categoryId: lead.categoryId,
    priority: lead.priority,
    status: lead.status,
    estimatedValue: (() => {
      if (!lead.estimatedValue?.trim()) return null
      const value = Number.parseFloat(lead.estimatedValue)
      if (!Number.isFinite(value) || value < 0) return null
      return String(Math.trunc(value))
    })(),
    attachmentUrl: lead.attachmentUrl,
    assignedEmployeeId: lead.assignedEmployeeId,
    assignedEmployeeName: lead.assignedEmployeeName,
    assignedByEmployeeId: lead.assignedByEmployeeId,
    assignedByEmployeeName: lead.assignedByEmployeeName,
    createdByEmployeeId: lead.createdByEmployeeId,
    createdByEmployeeName: lead.createdByEmployeeName,
    description: lead.description,
    requirements: lead.requirements,
  }
}

export function emptyLeadInput(): LeadInput {
  return {
    leadName: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    companySize: '',
    source: '',
    sourceId: '',
    category: '',
    categoryId: null,
    priority: 'Medium' as LeadPriority,
    status: 'New' as LeadStatus,
    estimatedValue: null,
    attachmentUrl: null,
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    assignedByEmployeeId: null,
    assignedByEmployeeName: null,
    createdByEmployeeId: null,
    createdByEmployeeName: null,
    description: '',
    requirements: '',
  }
}
