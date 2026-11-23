/**
 * Picklists for lead forms (sources, industry, etc.).
 */

export const LEAD_SOURCES = [
  'Website',
  'LinkedIn',
  'Referral',
  'Cold call',
  'Trade show',
  'Partner',
  'Other',
] as const

export const LEAD_CATEGORIES = [
  'Enterprise',
  'SMB',
  'Startup',
  'Government',
  'Non-profit',
] as const

export const LEAD_INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Education',
  'Other',
] as const

export const COMPANY_SIZES = [
  '1–10',
  '11–50',
  '51–200',
  '201–500',
  '501–1000',
  '1000+',
] as const

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
] as const

export const LEAD_PRIORITIES = ['High', 'Medium', 'Low'] as const

export const LEAD_ASSIGNEES = [
  { id: 'EMP-1005', name: 'Sneha Reddy' },
  { id: 'EMP-1003', name: 'Priya Nair' },
  { id: 'EMP-1002', name: 'Rahul Mehta' },
  { id: 'EMP-1001', name: 'Ananya Sharma' },
] as const