/**
 * React context for leads module state.
 */

import { createContext } from 'react'

import type { Lead, LeadDuplicateMatch, LeadInput } from '../types/lead'
import type { summarizeLeads } from '../services/leadsService'

export type LeadsContextValue = {
  leads: Lead[]
  loading: boolean
  error: string | null
  summary: ReturnType<typeof summarizeLeads>
  reload: () => void
  createLead: (input: LeadInput) => Promise<Lead>
  updateLead: (id: string, input: LeadInput) => Promise<Lead>
  deleteLead: (id: string) => Promise<void>
  addNote: (leadId: string, text: string) => Promise<Lead>
  addAttachment: (leadId: string, fileName: string) => Promise<Lead>
  checkDuplicates: (
    input: Pick<Lead, 'email' | 'phone' | 'companyName'>,
    excludeId?: string,
  ) => Promise<LeadDuplicateMatch[]>
  selectedLeadId: string | null
  setSelectedLeadId: (id: string | null) => void
}

export const LeadsContext = createContext<LeadsContextValue | null>(null)