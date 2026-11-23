/**
 * Stat row for Super Admin Audit tab.
 */

import { CalendarClock, FileStack, RefreshCw, Users } from 'lucide-react'

import { formatDate } from '../../utils/formatDate'
import type { SuperAdminAuditInsights } from '../../utils/superAdminAuditInsights'
import { LeaveStatGrid } from '../LeaveStatGrid'

type AuditTabOverviewProps = {
  insights: SuperAdminAuditInsights
}

export function AuditTabOverview({ insights }: AuditTabOverviewProps) {
  const lastChange =
    insights.lastSavedAt != null
      ? `${formatDate(insights.lastSavedAt.slice(0, 10))} ${insights.lastSavedAt.slice(11, 16)}`
      : '—'

  return (
    <LeaveStatGrid
      items={[
        {
          label: 'Settings changes',
          value: String(insights.totalEntries),
          detail: `${insights.uniqueEditors} editor(s)`,
          icon: FileStack,
          tone: 'primary',
        },
        {
          label: 'Last settings save',
          value: lastChange,
          icon: CalendarClock,
          tone: 'neutral',
        },
        {
          label: 'Accrual runs',
          value: String(insights.accrualRuns),
          icon: RefreshCw,
          tone: 'success',
        },
        {
          label: 'Year-end runs',
          value: String(insights.yearEndRuns),
          icon: Users,
          tone: 'warning',
        },
      ]}
    />
  )
}
