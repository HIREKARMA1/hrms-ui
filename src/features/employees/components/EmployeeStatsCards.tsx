import {
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
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  useGetAbsentTodayQuery,
  useGetLateArrivalsTodayQuery,
  useGetOnLeaveTodayQuery,
  useGetPresentTodayQuery,
} from '../api/employeeDashboardApi'
import { useEmployeeSummary } from '../hooks/useEmployeeSummary'

function percentOf(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

/**
 * Headcount from GET /dashboard/summary.
 * Present / absent / late / on-leave today from dedicated dashboard attendance & leave APIs.
 */
export function EmployeeStatsCards() {
  const { canAccess } = useOptionalFeatureAccess()
  const canStats = canAccess('employee.stats')
  const canReadLeaves = canAccess('employee.leaveAnalytics')
  const { summary, isLoading, isError, error } = useEmployeeSummary()

  const presentQuery = useGetPresentTodayQuery(
    { page: 1, limit: 1 },
    { skip: !canStats },
  )
  const absentQuery = useGetAbsentTodayQuery({ page: 1, limit: 1 }, { skip: !canStats })
  const lateQuery = useGetLateArrivalsTodayQuery({ page: 1, limit: 1 }, { skip: !canStats })
  const onLeaveQuery = useGetOnLeaveTodayQuery(
    { page: 1, limit: 1 },
    { skip: !canReadLeaves },
  )

  const totalEmployees = summary?.totalEmployees ?? 0
  const activeEmployees = summary?.activeEmployees ?? 0
  const inactiveEmployees = summary?.inactiveEmployees ?? 0
  const presentToday = presentQuery.data?.pagination.total ?? 0
  const absentToday = absentQuery.data?.pagination.total ?? 0
  const lateArrivals = lateQuery.data?.pagination.total ?? 0
  const onLeave =
    canReadLeaves && onLeaveQuery.data
      ? onLeaveQuery.data.pagination.total
      : (summary?.onLeaveEmployees ?? 0)

  const activePercent = percentOf(activeEmployees, totalEmployees)
  const presentPercent = percentOf(presentToday, totalEmployees)
  const absentPercent = percentOf(absentToday, totalEmployees)
  const onLeavePercent = percentOf(onLeave, totalEmployees)

  const value = (loading: boolean, content: ReactNode) =>
    loading ? <Skeleton className="mt-2 h-9 w-16" /> : content

  const attendanceError =
    presentQuery.isError || absentQuery.isError || lateQuery.isError || onLeaveQuery.isError
      ? getApiErrorMessage(
          presentQuery.error ?? absentQuery.error ?? lateQuery.error ?? onLeaveQuery.error,
          'Could not load today’s attendance metrics.',
        )
      : null

  return (
    <div className="space-y-2">
      {isError ? (
        <p className="text-xs text-rose-700">
          {getApiErrorMessage(error, 'Could not load headcount.')}
        </p>
      ) : null}
      {attendanceError ? <p className="text-xs text-rose-700">{attendanceError}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border-soft shadow-sm">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Employees</p>
              {value(isLoading, <p className="mt-2 text-3xl font-bold text-navy">{totalEmployees}</p>)}
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
                <p className="text-sm font-medium text-text-secondary">Active / Inactive</p>
                {value(
                  isLoading,
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
                <span>Terminated {percentOf(inactiveEmployees, totalEmployees)}%</span>
              </div>
              <Progress value={activePercent} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-text-secondary">Present Today</p>
              {value(
                presentQuery.isLoading,
                <p className="mt-2 text-3xl font-bold text-navy">{presentToday}</p>,
              )}
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
              <p className="text-sm font-medium text-text-secondary">Absent Today</p>
              {value(
                absentQuery.isLoading,
                <p className="mt-2 text-3xl font-bold text-navy">{absentToday}</p>,
              )}
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
              <p className="text-sm font-medium text-text-secondary">On Leave</p>
              {value(
                canReadLeaves ? onLeaveQuery.isLoading : isLoading,
                <p className="mt-2 text-3xl font-bold text-navy">{onLeave}</p>,
              )}
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#3B82F6]">
                <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                {canReadLeaves
                  ? `${onLeavePercent}% on approved leave today`
                  : `${onLeavePercent}% with On Leave status`}
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
              <p className="text-sm font-medium text-text-secondary">Late Arrivals</p>
              {value(
                lateQuery.isLoading,
                <p className="mt-2 text-3xl font-bold text-navy">{lateArrivals}</p>,
              )}
              <p className="mt-3 text-xs font-medium text-text-secondary">Today</p>
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
