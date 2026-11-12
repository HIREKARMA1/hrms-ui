import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  UserCheck,
  Users,
  UserX,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { DashboardStat } from '../types/dashboard'
import { dashboardStats } from '../utils/sampleData'

const iconMap: Record<DashboardStat['icon'], LucideIcon> = {
  users: Users,
  userCheck: UserCheck,
  calendarDays: CalendarDays,
  userX: UserX,
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat) => {
        const Icon = iconMap[stat.icon]
        return (
          <Card key={stat.id}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
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
