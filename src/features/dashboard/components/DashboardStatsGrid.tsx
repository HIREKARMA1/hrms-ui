import {
  CalendarDays,
  UserCheck,
  Users,
  UserX,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import type { DashboardStat } from '../types/dashboard'
import { DASH_CARD } from './shared/dashboardUi'

const iconMap: Record<DashboardStat['icon'], LucideIcon> = {
  users: Users,
  userCheck: UserCheck,
  calendarDays: CalendarDays,
  userX: UserX,
}

type DashboardStatsGridProps = {
  stats: DashboardStat[]
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon]
        return (
          <div key={stat.id} className={cn(DASH_CARD, 'p-5')}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#667085]">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#17213A]">
                  {stat.value}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  stat.iconClassName,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
