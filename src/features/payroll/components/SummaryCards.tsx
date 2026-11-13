/**
 * Four summary stat cards computed from the live employee list.
 * Used at the top of the Overview tab panel on PayrollPage.
 */

import { IndianRupee, MinusCircle, Users, Wallet } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import { usePayroll } from '../hooks/usePayroll'
import { formatCurrency } from '../utils/formatCurrency'

const items = [
  { key: 'employees', label: 'Employees', icon: Users, tint: 'bg-hrms-lavender text-hrms-primary' },
  { key: 'gross', label: 'Total gross pay', icon: Wallet, tint: 'bg-hrms-info/10 text-hrms-info' },
  { key: 'deductions', label: 'Total deductions', icon: MinusCircle, tint: 'bg-hrms-warning/10 text-hrms-warning' },
  { key: 'net', label: 'Total net pay', icon: IndianRupee, tint: 'bg-hrms-success/10 text-hrms-success' },
] as const

export function SummaryCards() {
  const { summary } = usePayroll()
  const values = {
    employees: String(summary.employeeCount),
    gross: formatCurrency(summary.totalGross),
    deductions: formatCurrency(summary.totalDeductions),
    net: formatCurrency(summary.totalNet),
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.key}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div>
                <p className="text-sm font-medium text-hrms-text-secondary">{item.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-hrms-navy">
                  {values[item.key]}
                </p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tint}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
