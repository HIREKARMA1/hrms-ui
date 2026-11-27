import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DASH_CARD } from './dashboardUi'

type QuickActionCardProps = {
  title: string
  description?: string
  icon: LucideIcon
  to: string
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  to,
}: QuickActionCardProps) {
  return (
    <Link
      to={to}
      className={`${DASH_CARD} flex items-center gap-3 p-4 transition-colors hover:border-[#14B8A6] hover:bg-[#F0FDFA]`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E]">
        <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#17213A]">{title}</p>
        {description ? (
          <p className="truncate text-xs text-[#667085]">{description}</p>
        ) : null}
      </div>
    </Link>
  )
}
