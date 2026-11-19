import {
  BadgeCheck,
  Hourglass,
  UserMinus,
  UserPlus,
  UserX,
  UsersRound,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import { useEmployeeSummary } from '../hooks/useEmployeeSummary'
import { workforceExtendedSummary } from '../mocks/employeeDashboard.mock'
import { employeeStatSummary } from '../mocks/employeeDashboard.mock'

/**
 * Additive workforce cards. Does not replace EmployeeStatsCards.
 * Headcount, probation and terminated come from GET /dashboard/summary when
 * permitted; new joiners, notice period and resigned have no API (sample).
 */
export function WorkforceExtendedStats() {
  const { summary } = useEmployeeSummary()
  const live = Boolean(summary)
  const { newJoinersThisMonth, onNoticePeriod, resigned } = workforceExtendedSummary

  const cards = [
    { label: 'Total Employees', value: summary?.totalEmployees ?? employeeStatSummary.totalEmployees, icon: UsersRound, sample: !live },
    { label: 'Active Employees', value: summary?.activeEmployees ?? employeeStatSummary.activeEmployees, icon: BadgeCheck, sample: !live },
    { label: 'Inactive Employees', value: summary?.inactiveEmployees ?? employeeStatSummary.inactiveEmployees, icon: UserX, sample: !live },
    { label: 'New Joiners This Month', value: newJoinersThisMonth, icon: UserPlus, sample: true },
    { label: 'Employees on Probation', value: summary?.probationEmployees ?? workforceExtendedSummary.onProbation, icon: Hourglass, sample: !live },
    { label: 'Employees on Notice Period', value: onNoticePeriod, icon: Hourglass, sample: true },
    { label: 'Resigned Employees', value: resigned, icon: UserMinus, sample: true },
    { label: 'Terminated Employees', value: summary?.inactiveEmployees ?? workforceExtendedSummary.terminated, icon: UserX, sample: !live },
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
                      Sample
                    </span>
                  ) : null}
                </p>
                <p className="text-2xl font-bold tabular-nums text-navy">
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
