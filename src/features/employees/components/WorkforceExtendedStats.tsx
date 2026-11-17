import {
  BadgeCheck,
  Hourglass,
  UserMinus,
  UserPlus,
  UserX,
  UsersRound,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import { workforceExtendedSummary } from '../mocks/employeeDashboard.mock'
import { employeeStatSummary } from '../mocks/employeeDashboard.mock'

/**
 * Additive workforce cards. Does not replace EmployeeStatsCards.
 * Total / Active / Inactive are also surfaced here for the requested widget set.
 */
export function WorkforceExtendedStats() {
  const { totalEmployees, activeEmployees, inactiveEmployees } = employeeStatSummary
  const {
    newJoinersThisMonth,
    onProbation,
    onNoticePeriod,
    resigned,
    terminated,
  } = workforceExtendedSummary

  const cards = [
    { label: 'Total Employees', value: totalEmployees, icon: UsersRound },
    { label: 'Active Employees', value: activeEmployees, icon: BadgeCheck },
    { label: 'Inactive Employees', value: inactiveEmployees, icon: UserX },
    { label: 'New Joiners This Month', value: newJoinersThisMonth, icon: UserPlus },
    { label: 'Employees on Probation', value: onProbation, icon: Hourglass },
    { label: 'Employees on Notice Period', value: onNoticePeriod, icon: Hourglass },
    { label: 'Resigned Employees', value: resigned, icon: UserMinus },
    { label: 'Terminated Employees', value: terminated, icon: UserX },
  ] as const

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
                <p className="text-sm text-text-secondary">{card.label}</p>
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
