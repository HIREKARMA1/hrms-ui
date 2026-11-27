/**
 * Workforce summary metric cards (live or mock).
 */

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Hourglass,
  UserCheck,
  Users,
  UserX,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { DashboardStat, DashboardStatIcon } from '../types/dashboard'

const iconMap: Record<DashboardStatIcon, LucideIcon> = {
  users: Users,
  userCheck: UserCheck,
  calendarDays: CalendarDays,
  userX: UserX,
  hourglass: Hourglass,
}

type DashboardStatsGridProps = {
  stats: DashboardStat[]
}

const GRID_CLASS = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className={GRID_CLASS}>
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon]
        return (
          <Card key={stat.id}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                {stat.footline ? (
                  <p className="mt-3 text-xs font-medium text-slate-500">{stat.footline}</p>
                ) : stat.trend ? (
                  <p
                    className={cn(
                      'mt-3 inline-flex items-center gap-1 text-xs font-medium',
                      stat.trend.positive ? 'text-emerald-600' : 'text-rose-600',
                    )}
                  >
                    {stat.trend.positive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {stat.trend.value}
                  </p>
                ) : null}
              </div>
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  stat.iconClassName,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export { GRID_CLASS as DASHBOARD_STATS_GRID_CLASS }