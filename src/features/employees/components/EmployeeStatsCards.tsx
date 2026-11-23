import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import { useEmployeeSummary } from '../hooks/useEmployeeSummary'
import { employeeStatSummary } from '../mocks/employeeDashboard.mock'

function SampleTag() {
  return (
    <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
      Sample
    </span>
  )
}

function percentOf(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

/**
 * Headcount (total, active, inactive, on leave) comes from GET /dashboard/summary.
 * Present / absent / late have no employee API and stay sample data.
 */
export function EmployeeStatsCards() {
  const { summary, isLoading, isError, error } = useEmployeeSummary()
  const {
    totalChangePercent,
    presentToday,
    presentPercent,
    absentToday,
    absentPercent,
    lateArrivals,
    lateChangeVsYesterday,
  } = employeeStatSummary

  const live = Boolean(summary)
  const totalEmployees = summary?.totalEmployees ?? employeeStatSummary.totalEmployees
  const activeEmployees = summary?.activeEmployees ?? employeeStatSummary.activeEmployees
  const inactiveEmployees = summary?.inactiveEmployees ?? employeeStatSummary.inactiveEmployees
  const onLeave = summary?.onLeaveEmployees ?? employeeStatSummary.onLeave
  const onLeavePercent = live ? percentOf(onLeave, totalEmployees) : employeeStatSummary.onLeavePercent
  const activePercent = percentOf(activeEmployees, totalEmployees)

  const value = (content: ReactNode) =>
    isLoading ? <Skeleton className="mt-2 h-9 w-16" /> : content

  return (
    <div className="space-y-2">
      {isError ? (
        <p className="text-xs text-rose-700">
          {getApiErrorMessage(error, 'Could not load headcount.')} Showing sample figures.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border-soft shadow-sm">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Total Employees
                {live || isLoading ? null : <SampleTag />}
              </p>
              {value(<p className="mt-2 text-3xl font-bold text-navy">{totalEmployees}</p>)}
              {live ? null : (
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#16A34A]">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{totalChangePercent}% from last month
                </p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender text-brand-500">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Active / Inactive
                  {live || isLoading ? null : <SampleTag />}
                </p>
                {value(
                  <p className="mt-2 text-3xl font-bold text-navy">
                    {activeEmployees}
                    <span className="text-lg font-semibold text-text-secondary">
                      {' '}
                      / {inactiveEmployees}
                    </span>
                  </p>,
                )}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Active {activePercent}%</span>
                <span>{live ? `Terminated ${percentOf(inactiveEmployees, totalEmployees)}%` : `Inactive ${100 - activePercent}%`}</span>
              </div>
              <Progress value={activePercent} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Present Today
                <SampleTag />
              </p>
              <p className="mt-2 text-3xl font-bold text-navy">{presentToday}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                {presentPercent}% of workforce
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Absent Today
                <SampleTag />
              </p>
              <p className="mt-2 text-3xl font-bold text-navy">{absentToday}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#EF4444]">
                <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                {absentPercent}% of workforce
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#EF4444]">
              <UserX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                On Leave
                {live || isLoading ? null : <SampleTag />}
              </p>
              {value(<p className="mt-2 text-3xl font-bold text-navy">{onLeave}</p>)}
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#3B82F6]">
                <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                {live
                  ? `${onLeavePercent}% with On Leave status`
                  : `${onLeavePercent}% currently on leave`}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#3B82F6]">
              <CalendarDays className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Late Arrivals
                <SampleTag />
              </p>
              <p className="mt-2 text-3xl font-bold text-navy">{lateArrivals}</p>
              <p
                className={cn(
                  'mt-3 inline-flex items-center gap-1 text-xs font-medium',
                  lateChangeVsYesterday >= 0 ? 'text-[#EF4444]' : 'text-[#16A34A]',
                )}
              >
                {lateChangeVsYesterday >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {lateChangeVsYesterday >= 0 ? '+' : ''}
                {lateChangeVsYesterday} vs yesterday
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#F59E0B]">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
