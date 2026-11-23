import { cn } from '@/lib/utils'

import type { LeadStatus } from '../types/lead'

const tone: Record<LeadStatus, string> = {
  New: 'bg-sky-50 text-sky-800',
  Contacted: 'bg-violet-50 text-violet-800',
  Qualified: 'bg-emerald-50 text-emerald-800',
  Proposal: 'bg-indigo-50 text-indigo-800',
  Negotiation: 'bg-orange-50 text-orange-900',
  Won: 'bg-green-50 text-green-800',
  Lost: 'bg-slate-100 text-slate-600',
}

export function LeadStatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone[status],
      )}
    >
      {status}
    </span>
  )
}