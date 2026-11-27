import {
  BadgeCheck,
  Hourglass,
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

/**
 * Workforce count cards from GET /dashboard/summary and dedicated list totals.
 */
export function WorkforceExtendedStats() {
  const { summary, isLoading: summaryLoading } = useEmployeeSummary()
  const newJoinersQuery = useGetNewJoinersQuery({ page: 1, limit: 1 })
  const probationQuery = useGetOnProbationEmployeesQuery({ page: 1, limit: 1 })
  const terminatedQuery = useGetTerminatedEmployeesQuery({ page: 1, limit: 1 })

  const cards = [
    {
      label: 'Total Employees',
      value: summary?.totalEmployees ?? 0,
      icon: UsersRound,
      loading: summaryLoading,
    },
    {
      label: 'Active Employees',
      value: summary?.activeEmployees ?? 0,
      icon: BadgeCheck,
      loading: summaryLoading,
    },
    {
      label: 'Inactive Employees',
      value: summary?.inactiveEmployees ?? 0,
      icon: UserX,
      loading: summaryLoading,
    },
    {
      label: 'New Joiners This Month',
      value: newJoinersQuery.data?.pagination.total ?? 0,
      icon: UserPlus,
      loading: newJoinersQuery.isLoading,
    },
    {
      label: 'Employees on Probation',
      value:
        probationQuery.data?.pagination.total ?? summary?.probationEmployees ?? 0,
      icon: Hourglass,
      loading: probationQuery.isLoading || summaryLoading,
    },
    {
      label: 'Terminated Employees',
      value:
        terminatedQuery.data?.pagination.total ?? summary?.inactiveEmployees ?? 0,
      icon: UserX,
      loading: terminatedQuery.isLoading || summaryLoading,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="border-border-soft shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">{card.label}</p>
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