import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { employeeStatSummary } from '../mocks/employeeDashboard.mock'

export function EmployeeStatsCards() {
  const {
    totalEmployees,
    totalChangePercent,
    activeEmployees,
    inactiveEmployees,
    presentToday,
    presentPercent,
    absentToday,
    absentPercent,
    onLeave,
    onLeavePercent,
    lateArrivals,
    lateChangeVsYesterday,
  } = employeeStatSummary

  const activePercent = Math.round((activeEmployees / totalEmployees) * 100)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Card className="border-border-soft shadow-sm">
        <CardContent className="flex items-start justify-between gap-3 p-5">
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Employees</p>
            <p className="mt-2 text-3xl font-bold text-navy">{totalEmployees}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#16A34A]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +{totalChangePercent}% from last month
            </p>
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
              </p>
              <p className="mt-2 text-3xl font-bold text-navy">
                {activeEmployees}
                <span className="text-lg font-semibold text-text-secondary">
                  {' '}
                  / {inactiveEmployees}
                </span>
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Active {activePercent}%</span>
              <span>Inactive {100 - activePercent}%</span>
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
            <p className="text-sm font-medium text-text-secondary">On Leave</p>
            <p className="mt-2 text-3xl font-bold text-navy">{onLeave}</p>
            <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#3B82F6]">
              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              {onLeavePercent}% currently on leave
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
  )
}
