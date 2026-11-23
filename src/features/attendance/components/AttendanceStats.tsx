import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  LogOut,
  Sunset,
  Timer,
  UserCheck,
  Users,
  UserX,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { attendanceStats } from '../mocks/attendanceMocks'
import type { AttendanceStat } from '../types/attendance'

const iconMap: Record<AttendanceStat['icon'], LucideIcon> = {
  users: Users,
  userCheck: UserCheck,
  userX: UserX,
  calendarDays: CalendarDays,
  clock: Clock,
  logOut: LogOut,
  sunset: Sunset,
  timer: Timer,
}

export function AttendanceStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {attendanceStats.map((stat) => {
        const Icon = iconMap[stat.icon]
        return (
          <Card key={stat.id} className="border-border-soft shadow-sm">
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-secondary">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-navy">
                  {stat.value}
                </p>
                <p
                  className={cn(
                    'mt-3 inline-flex items-center gap-1 text-xs font-medium',
                    stat.positive ? 'text-[#16A34A]' : 'text-[#EF4444]',
                  )}
                >
                  {stat.positive ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {stat.trend}
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
