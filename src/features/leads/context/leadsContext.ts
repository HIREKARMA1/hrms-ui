/**
 * React context for leads module state.
 */

import { createContext } from 'react'

import type { LeadAnalyticsResult } from '../api/leadsApi.types'
import type { Lead, LeadDuplicateMatch, LeadInput, LeadPriority, LeadStatus } from '../types/lead'
import type { summarizeLeads } from '../utils/summarizeLeads'

export type LeadsListQuery = {
  page: number
  limit: number
  search: string
  status: LeadStatus | 'All'
  priority: LeadPriority | 'All'
  assignedEmployeeId?: string
}

export type LeadsContextValue = {
  leads: Lead[]
  loading: boolean
  error: string | null
  summary: ReturnType<typeof summarizeLeads>
  analytics: LeadAnalyticsResult | null
  analyticsLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  listQuery: LeadsListQuery
  setListQuery: (patch: Partial<LeadsListQuery>) => void
  reload: () => void
  createLead: (input: LeadInput) => Promise<Lead>
  updateLead: (id: string, input: LeadInput) => Promise<Lead>
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<Lead>
  updateLeadPriority: (id: string, priority: LeadPriority) => Promise<Lead>
  assignLead: (id: string, employeeId: string) => Promise<Lead>
  deleteLead: (id: string) => Promise<void>
  addNote: (leadId: string, text: string) => Promise<Lead>
  addAttachment: (leadId: string, fileName: string) => Promise<Lead>
  checkDuplicates: (
    input: Pick<Lead, 'email' | 'phone' | 'companyName'>,
    excludeId?: string,
  ) => Promise<LeadDuplicateMatch[]>
  selectedLeadId: string | null
  setSelectedLeadId: (id: string | null) => void
  getLeadDetail: (id: string) => Promise<Lead>
}

export const LeadsContext = createContext<LeadsContextValue | null>(null)
