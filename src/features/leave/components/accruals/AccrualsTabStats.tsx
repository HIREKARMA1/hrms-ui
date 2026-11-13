/**
 * Stat cards for Accruals & Year-End tab preview counts.
 */

import { BookOpen, CalendarClock, Database, Users } from 'lucide-react'

import { LeaveStatGrid } from '../LeaveStatGrid'

type AccrualsTabStatsProps = {
  employeeCount: number
  accrualLines: number
  yearEndLines: number
  accrualMonth: string
}

export function AccrualsTabStats({ employeeCount, accrualLines, yearEndLines, accrualMonth }: AccrualsTabStatsProps) {
  return (
    <LeaveStatGrid
      items={[
        { label: 'Eligible employees', value: String(employeeCount), icon: Users, tone: 'neutral' },
        { label: 'Accrual preview rows', value: String(accrualLines), icon: Database, tone: 'primary' },
        { label: 'Year-end adjustments', value: String(yearEndLines), icon: BookOpen, tone: 'success' },
        { label: 'Accrual month', value: accrualMonth, icon: CalendarClock, tone: 'warning' },
      ]}
    />
  )
}
