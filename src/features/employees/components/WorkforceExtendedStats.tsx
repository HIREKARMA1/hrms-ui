import {
  BadgeCheck,
  Hourglass,
  UserMinus,
  UserPlus,
  UserX,
  UsersRound,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import {
  useGetNewJoinersQuery,
  useGetOnProbationEmployeesQuery,
  useGetTerminatedEmployeesQuery,
} from '../api/employeeDashboardApi'
import { useEmployeeSummary } from '../hooks/useEmployeeSummary'
import { workforceExtendedSummary } from '../mocks/employeeDashboard.mock'

/**
 * Additive workforce cards. Live headcount / probation / terminated / new joiners.
 * Notice period and resigned stay hardcoded until those APIs exist.
 */
export function WorkforceExtendedStats() {
  const { summary, isLoading: summaryLoading } = useEmployeeSummary()
  const newJoinersQuery = useGetNewJoinersQuery({ page: 1, limit: 1 })
  const probationQuery = useGetOnProbationEmployeesQuery({ page: 1, limit: 1 })
  const terminatedQuery = useGetTerminatedEmployeesQuery({ page: 1, limit: 1 })

  const { onNoticePeriod, resigned } = workforceExtendedSummary

  const cards = [
    {
      label: 'Total Employees',
      value: summary?.totalEmployees ?? 0,
      icon: UsersRound,
      loading: summaryLoading,
      sample: false,
    },
    {
      label: 'Active Employees',
      value: summary?.activeEmployees ?? 0,
      icon: BadgeCheck,
      loading: summaryLoading,
      sample: false,
    },
    {
      label: 'Inactive Employees',
      value: summary?.inactiveEmployees ?? 0,
      icon: UserX,
      loading: summaryLoading,
      sample: false,
    },
    {
      label: 'New Joiners This Month',
      value: newJoinersQuery.data?.pagination.total ?? 0,
      icon: UserPlus,
      loading: newJoinersQuery.isLoading,
      sample: false,
    },
    {
      label: 'Employees on Probation',
      value:
        probationQuery.data?.pagination.total ??
        summary?.probationEmployees ??
        0,
      icon: Hourglass,
      loading: probationQuery.isLoading && summaryLoading,
      sample: false,
    },
    {
      label: 'Employees on Notice Period',
      value: onNoticePeriod,
      icon: Hourglass,
      loading: false,
      sample: true,
    },
    {
      label: 'Resigned Employees',
      value: resigned,
      icon: UserMinus,
      loading: false,
      sample: true,
    },
    {
      label: 'Terminated Employees',
      value:
        terminatedQuery.data?.pagination.total ??
        summary?.inactiveEmployees ??
        0,
      icon: UserX,
      loading: terminatedQuery.isLoading && summaryLoading,
      sample: false,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="border-border-soft shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">
                  {card.label}
                  {card.sample ? (
                    <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                      Later
                    </span>
                  ) : null}
                </p>
                {card.loading ? (
                  <Skeleton className="mt-1 h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold tabular-nums text-navy">{card.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
