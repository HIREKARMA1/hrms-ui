/**
 * Duplicate detection by email, phone, or company name (case-insensitive).
 */

import type { Lead, LeadDuplicateMatch } from '../types/lead'

function norm(value: string) {
  return value.trim().toLowerCase()
}

function digits(phone: string) {
  return phone.replace(/\D/g, '')
}

export function findLeadDuplicates(
  leads: Lead[],
  input: Pick<Lead, 'email' | 'phone' | 'companyName'>,
  excludeId?: string,
): LeadDuplicateMatch[] {
  const email = norm(input.email)
  const company = norm(input.companyName)
  const phone = digits(input.phone)

  return leads
    .filter((item) => item.id !== excludeId)
    .map((lead) => {
      const reasons: string[] = []
      if (email && norm(lead.email) === email) reasons.push('Email matches')
      if (company && norm(lead.companyName) === company) reasons.push('Company name matches')
      if (phone.length >= 6 && digits(lead.phone) === phone) reasons.push('Phone matches')
      return reasons.length ? { lead, reasons } : null
    })
    .filter((item): item is LeadDuplicateMatch => item !== null)
}