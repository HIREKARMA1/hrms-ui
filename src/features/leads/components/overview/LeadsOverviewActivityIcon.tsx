import { ArrowLeftRight, Check, Plus, X } from 'lucide-react'

import type { LeadActivityType } from '../../types/lead'
import { cn } from '@/lib/utils'

type LeadsOverviewActivityIconProps = {
  type: LeadActivityType
  summary: string
}

export function LeadsOverviewActivityIcon({ type, summary }: LeadsOverviewActivityIconProps) {
  const lower = summary.toLowerCase()
  const isWon = lower.includes('won')
  const isLost = lower.includes('lost')

  let shell = 'bg-[#F0EDFF] text-[#5938DB]'
  let Icon = Plus

  if (isWon) {
    shell = 'bg-[#DCFCE7] text-[#15803D]'
    Icon = Check
  } else if (isLost) {
    shell = 'bg-[#FEE2E2] text-[#B91C1C]'
    Icon = X
  } else if (type === 'created') {
    shell = 'bg-[#F0EDFF] text-[#5938DB]'
    Icon = Plus
  } else if (type === 'status') {
    shell = 'bg-[#DBEAFE] text-[#1D4ED8]'
    Icon = ArrowLeftRight
  }

  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
        shell,
      )}
      aria-hidden
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
    </span>
  )
}