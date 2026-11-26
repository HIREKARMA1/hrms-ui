/**
 * Picklists for lead forms. Sources/categories come from the live API.
 */

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