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
    category: lead.category,
    priority: lead.priority,
    status: lead.status,
    assignedEmployeeId: lead.assignedEmployeeId,
    assignedEmployeeName: lead.assignedEmployeeName,
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
    industry: 'Technology',
    companySize: '11–50',
    source: 'Website',
    category: 'SMB',
    priority: 'Medium' as LeadPriority,
    status: 'New' as LeadStatus,
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    description: '',
    requirements: '',
  }
}