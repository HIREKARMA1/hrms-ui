import {
  CalendarDays,
  Clock,
  Sunset,
  UserCheck,
  Users,
  UserX,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/errors'

import { useAttendanceOverviewTodayMetrics } from '../hooks/useAttendanceOverviewTodayMetrics'

type StatCard = {
  id: string
  label: string
  value: number
  icon: LucideIcon
  iconClassName: string
  footnote?: string
  footnoteClassName?: string
}

export function AttendanceStats() {
  const metrics = useAttendanceOverviewTodayMetrics()

  const cards: StatCard[] = [
    {
      id: 'total',
      label: 'Total Employees',
      value: metrics.totalEmployees,
      icon: Users,
      iconClassName: 'bg-lavender text-brand-500',
    },
    {
      id: 'present',
      label: 'Present Today',
      value: metrics.presentToday,
      icon: UserCheck,
      iconClassName: 'bg-emerald-50 text-[#16A34A]',
      footnote: 'Live device punches',
      footnoteClassName: 'text-[#16A34A]',
    },
    {
      id: 'absent',
      label: 'Absent Today',
      value: metrics.absentToday,
      icon: UserX,
      iconClassName: 'bg-rose-50 text-[#EF4444]',
      footnote: 'Working day roster',
      footnoteClassName: 'text-[#EF4444]',
    },
    {
      id: 'leave',
      label: 'On Leave',
      value: metrics.onLeaveToday,
      icon: CalendarDays,
      iconClassName: 'bg-sky-50 text-[#3B82F6]',
      footnote: metrics.canLeave ? 'Approved leave today' : 'From summary',
      footnoteClassName: 'text-[#3B82F6]',
    },
    {
      id: 'late',
      label: 'Late Arrivals',
      value: metrics.lateToday,
      icon: Clock,
      iconClassName: 'bg-amber-50 text-[#F59E0B]',
      footnote: 'Today',
      footnoteClassName: 'text-text-secondary',
    },
    {
      id: 'half',
      label: 'Half-Day',
      value: metrics.halfDayToday,
      icon: Sunset,
      iconClassName: 'bg-violet-50 text-violet-600',
      footnote: 'Policy engine · today',
      footnoteClassName: 'text-text-secondary',
    },
  ]

  const value = (loading: boolean, content: ReactNode) =>
    loading ? <Skeleton className="mt-2 h-9 w-16" /> : content

  const err = metrics.statsError
    ? getApiErrorMessage(
        metrics.summaryError ??
          metrics.presentError ??
          metrics.absentError ??
          metrics.lateError ??
          metrics.onLeaveError,
        'Could not load attendance counts.',
      )
    : null

  return (
    <div className="space-y-2">
      {err ? (
        <p className="text-xs text-rose-700" role="alert">
          {err}
        </p>
      ) : null}
      {metrics.halfDayError ? (
        <p className="text-xs text-amber-800" role="status">
          Half-day count unavailable from analytics.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((stat) => {
          const Icon = stat.icon
          const loading =
            stat.id === 'half'
              ? metrics.halfDayLoading && metrics.halfDayToday === 0
              : metrics.statsLoading
          return (
            <Card key={stat.id} className="border-border-soft shadow-sm">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                  {value(loading, <p className="mt-2 text-3xl font-bold text-navy">{stat.value}</p>)}
                  {stat.footnote ? (
                    <p className={`mt-3 text-xs font-medium ${stat.footnoteClassName ?? ''}`}>
                      {stat.footnote}
                    </p>
                  ) : null}
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClassName}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}