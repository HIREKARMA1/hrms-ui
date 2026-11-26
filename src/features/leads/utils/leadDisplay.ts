/**
 * Display helpers for leads — company is the primary label (no contact full-name field).
 */

import type { Lead } from '../types/lead'

/** Single title for tables/cards: company, else stored lead name, else email. */
export function leadCompanyLabel(lead: Pick<Lead, 'companyName' | 'leadName' | 'email'>): string {
  const company = lead.companyName.trim()
  if (company) return company
  const name = lead.leadName.trim()
  if (name) return name
  return lead.email.trim() || '—'
}

/** True when leadName is only a duplicate of company (auto-filled on create). */
export function isLeadNameSameAsCompany(lead: Pick<Lead, 'companyName' | 'leadName'>): boolean {
  const company = lead.companyName.trim().toLowerCase()
  const name = lead.leadName.trim().toLowerCase()
  return Boolean(company && name && company === name)
}
